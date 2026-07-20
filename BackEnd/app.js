const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');


const recoverPasswRoutes = require('./src/routes/recoverPasswRoutes');
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const publicRoutes = require('./src/routes/publicRoutes');
const adminPublicRoutes = require('./src/routes/adminPublicRoutes');
const thumbRoutes = require('./src/routes/thumbRoutes');

//MIDDLEWARE
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "https://storage.googleapis.com"],
      "media-src": ["'self'", "https://storage.googleapis.com"],
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5199',
];
const envOrigins = (process.env.CORS_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
const allowedOrigins = [...defaultOrigins, ...envOrigins];

app.use(cors((req, callback) => {
  const origin = req.header('Origin');
  let allow = !origin || allowedOrigins.includes(origin);
  if (!allow && origin) {
    // Mismo origen (front y API serviditos por el mismo host, ej. detrás de un túnel):
    // el navegador igual manda Origin, así que lo comparamos contra el Host de la request.
    try { allow = new URL(origin).host === req.headers.host; } catch { /* origin inválido */ }
  }
  callback(null, { origin: allow, credentials: true });
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
    const token = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;
    req.session = { user: null };

    try {
        // Access token válido → sesión normal
        const data = jwt.verify(token, process.env.SECRET_WEB_TOKEN);
        req.session.user = data;
    } catch (error) {
        // Access token expirado/inválido → intentar con refresh token
        if (refreshToken) {
            try {
                const refreshData = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                // Emitir nuevo access token transparentemente
                const newAccessToken = jwt.sign(
                    { id: refreshData.id, role: refreshData.role },
                    process.env.SECRET_WEB_TOKEN,
                    { expiresIn: '1h' }
                );
                res.cookie('access_token', newAccessToken, {
                    httpOnly: true,
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 1000 * 60 * 60
                });
                req.session.user = { id: refreshData.id, role: refreshData.role };
            } catch (refreshError) {
                // Refresh token también expirado → sin sesión, el usuario deberá loguearse
            }
        }
    }
    next();
});


// Rutas públicas
app.use('/api/public', publicRoutes);
app.use('/api/thumb', thumbRoutes);

// Rutas administrativas para contenido público
app.use('/api/admin/public-content', adminPublicRoutes);
app.use('/user',userRoutes);
app.use('/auth',authRoutes);
app.use('/recover',recoverPasswRoutes);
app.use('/admin', adminRoutes)

// Frontend build (mismo origen que la API, sin CORS entre sitio y backend)
const FRONTEND_DIST = path.join(__dirname, '..', 'FrontEnd', 'dist');
app.use(express.static(FRONTEND_DIST));
app.get(/^\/(?!api|user|auth|recover|admin).*/, (req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
});

// Manejador de errores global: evita devolver stack traces crudos al cliente
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error del servidor'
    });
});

module.exports = app;



