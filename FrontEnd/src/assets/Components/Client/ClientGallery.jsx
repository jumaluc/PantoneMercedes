import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Lazy image: renderiza el <img> solo cuando entra al viewport ──
const LazyImage = ({ src, alt, imageId, onOrientationDetected }) => {
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { rootMargin: '600px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleLoad = (e) => {
    setLoaded(true);
    onOrientationDetected?.(imageId, e.target.naturalHeight > e.target.naturalWidth);
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div className="img-skeleton" style={{ opacity: loaded ? 0 : 1, transition: 'opacity 0.35s ease', pointerEvents: 'none' }} />
      {inView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={handleLoad}
          onError={(e) => { e.target.src = '/placeholder-image.jpg'; setLoaded(true); }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: loaded ? 1 : 0, transition: 'opacity 0.35s ease', display: 'block' }}
        />
      )}
    </div>
  );
};
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faEdit, faEraser, faTrash, faSpinner, faImages, faCheckCircle, faSearchPlus, faArrowUp, faTimes, faEye, faComment, faChevronLeft, faChevronRight, faVideo } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import './Gallery.css';
import ImageCommentsOverlay from './ImageCommentsOverlay';
import SongSelectionModal from './SongSelectionModal';
import { API_URL } from '../../../config/api';

const FEATURE_INTERVAL = 8;

const Gallery = ({ user, setActiveSection }) => {
  const [galleriesData, setGalleriesData] = useState([]);
  // Usar localStorage para persistir el índice de galería
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(() => {
    // Recuperar el índice guardado o usar 0 por defecto
    const savedIndex = localStorage.getItem('currentGalleryIndex');
    return savedIndex ? parseInt(savedIndex) : 0;
  });
  const [selectedImages, setSelectedImages] = useState(new Set());

  const storageKey = (galleryId) => `pantone_selection_${galleryId}`;
  const [loading, setLoading] = useState(true);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayImage, setOverlayImage] = useState(null);
  const [overlayIndex, setOverlayIndex] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const imageOrientations = useRef(new Map());
  const [orientationTick, setOrientationTick] = useState(0);
  const orientationUpdateTimer = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showCommentsOverlay, setShowCommentsOverlay] = useState(false);
  const [commentsImage, setCommentsImage] = useState(null);
  const [showSongModal, setShowSongModal] = useState(false);
  const [confirmingSelection, setConfirmingSelection] = useState(false);
  const [songSelection, setSongSelection] = useState(null);
  const [filterOrientation, setFilterOrientation] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  // Obtener la galería actual
  const currentGallery = galleriesData[currentGalleryIndex] || null;
  const currentGalleryId = currentGallery?.gallery?.id;
  const selectionLocked = currentGallery?.selection_locked || false;
  const videoReady = currentGallery?.video_ready || false;

  // Guardar el índice actual en localStorage cuando cambie
  useEffect(() => {
    if (galleriesData.length > 0) {
      localStorage.setItem('currentGalleryIndex', currentGalleryIndex.toString());
    }
  }, [currentGalleryIndex, galleriesData.length]);

  useEffect(() => {
    fetchGalleries();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cargar canciones cuando la selección está confirmada
  useEffect(() => {
    if (!currentGalleryId || !selectionLocked) {
      setSongSelection(null);
      return;
    }
    fetch(`${API_URL}/user/getSongSelection?gallery_id=${currentGalleryId}`, {
      credentials: 'include'
    })
      .then(r => r.json())
      .then(data => setSongSelection(data.selection || null))
      .catch(() => setSongSelection(null));
  }, [currentGalleryId, selectionLocked]);

  // Cargar/restaurar la selección cada vez que cambia la galería activa o su estado locked
  useEffect(() => {
    if (!currentGallery) return;

    if (selectionLocked) {
      // Selección confirmada: mostrar las imágenes marcadas en la DB
      const confirmedIds = new Set(
        currentGallery.images.filter(img => img.is_selected === 1).map(img => img.id)
      );
      setSelectedImages(confirmedIds);
    } else {
      // Selección en progreso: restaurar desde localStorage
      const saved = localStorage.getItem(storageKey(currentGalleryId));
      if (saved) {
        try {
          const ids = JSON.parse(saved);
          // Solo conservar IDs que existan en esta galería
          const validIds = ids.filter(id => currentGallery.images.some(img => img.id === id));
          setSelectedImages(new Set(validIds));
        } catch {
          setSelectedImages(new Set());
        }
      } else {
        setSelectedImages(new Set());
      }
    }
  }, [currentGalleryId, selectionLocked]);

  // Limpiar orientaciones al cambiar de galería
  useEffect(() => {
    imageOrientations.current = new Map();
    setOrientationTick(0);
    return () => {
      if (orientationUpdateTimer.current) clearTimeout(orientationUpdateTimer.current);
    };
  }, [currentGalleryId]);

  const handleOrientationDetected = useCallback((imageId, isVertical) => {
    imageOrientations.current.set(imageId, isVertical);
    // Agrupa varias detecciones simultáneas (scroll rápido) en un solo re-render
    // para no repaquetizar el grid una vez por cada imagen que termina de cargar.
    if (orientationUpdateTimer.current) return;
    orientationUpdateTimer.current = setTimeout(() => {
      orientationUpdateTimer.current = null;
      setOrientationTick(t => t + 1);
    }, 120);
  }, []);

  // Las imágenes de la galería actual (sin pre-carga masiva)
  const processedImages = currentGallery?.images || [];

  const handleScroll = () => {
    setShowScrollTop(window.scrollY > 300);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/user/getGallery`, {
        credentials: 'include'
      });

      // 404 = sin galerías todavía, no es un error
      if (response.status === 404) {
        setGalleriesData([]);
        return;
      }

      if (!response.ok) {
        throw new Error('Error al cargar galerías');
      }

      const data = await response.json();
      const galleries = data.data || [];
      setGalleriesData(galleries);

      if (galleries.length > 0) {
        const savedIndex = localStorage.getItem('currentGalleryIndex');
        const indexToUse = savedIndex
          ? Math.min(parseInt(savedIndex), galleries.length - 1)
          : 0;
        setCurrentGalleryIndex(indexToUse);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar las galerías', { id: 'gallery-fetch-error' });
    } finally {
      setLoading(false);
    }
  };

  const navigateGallery = (direction) => {
    if (galleriesData.length <= 1) return;
    
    let newIndex = currentGalleryIndex + direction;
    if (newIndex < 0) newIndex = galleriesData.length - 1;
    if (newIndex >= galleriesData.length) newIndex = 0;
    
    setCurrentGalleryIndex(newIndex);
    // La selección se restaura automáticamente desde localStorage/DB vía useEffect
  };

  const toggleImageSelection = (imageId, event) => {
    if (event) event.stopPropagation();
    if (selectionLocked) return;
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
    // Persistir en localStorage inmediatamente (solo si no está bloqueada)
    if (!selectionLocked && currentGalleryId) {
      localStorage.setItem(storageKey(currentGalleryId), JSON.stringify(Array.from(newSelected)));
    }
  };

  const handleImageClick = (image, index, event) => {
    if (selectedImages.size > 0) {
      if (event) event.stopPropagation();
      toggleImageSelection(image.id, event);
      return;
    }
    setOverlayImage(image);
    setOverlayIndex(index);
    setOverlayVisible(true);
  };

  const handleZoomClick = (image, index, event) => {
    event.stopPropagation();
    setOverlayImage(image);
    setOverlayIndex(index);
    setOverlayVisible(true);
  };

  const handleCommentsClick = (image, event) => {
    event.stopPropagation();
    setCommentsImage(image);
    setShowCommentsOverlay(true);
  };

  const handleOverlayClose = () => {
    setOverlayVisible(false);
    setOverlayImage(null);
  };

  const handleCommentsOverlayClose = () => {
    setShowCommentsOverlay(false);
    setCommentsImage(null);
  };

  const handleOverlayImageClick = (imageId, event) => {
    event.stopPropagation();
    toggleImageSelection(imageId);
  };

  const navigateOverlay = (direction) => {
    if (!displayedImages || displayedImages.length === 0) return;
    let newIndex = overlayIndex + direction;
    if (newIndex < 0) newIndex = displayedImages.length - 1;
    if (newIndex >= displayedImages.length) newIndex = 0;
    setOverlayIndex(newIndex);
    setOverlayImage(displayedImages[newIndex]);
  };

  const downloadSelected = async () => {
    if (selectedImages.size === 0) {
      toast.info('Selecciona al menos una imagen para descargar');
      return;
    }
    setDownloading(true);
    try {
      const response = await fetch(`${API_URL}/user/downloadImages`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imageIds: Array.from(selectedImages),
          imageUrls: Array.from(selectedImages).map(id => {
            const image = processedImages.find(img => img.id === id);
            return image ? image.image_url : '';
          }),
          galleryId: currentGalleryId
        })
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const galleryName = currentGallery?.gallery?.title || 'galeria';
        const timestamp = new Date().getTime();
        link.download = `${galleryName}-${timestamp}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al descargar las imágenes');
      }
    } catch (error) {
      console.error('Error en el proceso de descarga:', error);
      toast.error(error.message || 'Error al descargar las imágenes');
    } finally {
      setDownloading(false);
    }
  };

  const downloadSingleImage = async (imageId, imageUrl, filename) => {
    try {
      const response = await fetch(`${API_URL}/user/downloadSingleImage`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: imageUrl,
          filename: filename || `image_${imageId}`,
          galleryId: currentGalleryId
        })
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const contentType = response.headers.get('content-type');
        let fileExtension = 'jpg';
        if (contentType && contentType.includes('image/')) {
          fileExtension = contentType.split('/')[1];
        } else {
          fileExtension = imageUrl.split('.').pop() || 'jpg';
        }
        link.download = `${filename || 'image'}.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al descargar la imagen');
      }
    } catch (error) {
      console.error('Error descargando imagen:', error);
      toast.error(error.message || 'Error al descargar la imagen');
    }
  };

  const confirmSelection = () => {
    if (selectedImages.size === 0) {
      toast.info('No hay imágenes seleccionadas para confirmar');
      return;
    }
    setShowSongModal(true);
  };

  const handleSongConfirm = async (songs, letAdminChoose, notes) => {
    setConfirmingSelection(true);
    try {
      const [imagesRes, songsRes] = await Promise.all([
        fetch(`${API_URL}/user/confirmSelection`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageIds: Array.from(selectedImages), galleryId: currentGalleryId })
        }),
        fetch(`${API_URL}/user/saveSongSelection`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ galleryId: currentGalleryId, songs, letAdminChoose, notes })
        })
      ]);

      if (!imagesRes.ok) {
        const err = await imagesRes.json();
        throw new Error(err.error || 'Error al confirmar imágenes');
      }

      setShowSongModal(false);
      localStorage.removeItem(storageKey(currentGalleryId));
      toast.success('¡Selección confirmada! Tu fotógrafo ya recibió tus fotos y canciones.');
      fetchGalleries();
    } catch (error) {
      console.error('Error confirmando selección:', error);
      toast.error(error.message || 'Error al confirmar la selección');
    } finally {
      setConfirmingSelection(false);
    }
  };

  const previewSelected = () => {
    if (selectedImages.size === 0) {
      toast.info('No hay imágenes seleccionadas para previsualizar');
      return;
    }
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
  };

  const clearSelection = () => {
    setSelectedImages(new Set());
    if (currentGalleryId) {
      localStorage.removeItem(storageKey(currentGalleryId));
    }
  };

  const cancelSelectionByClient = async () => {
    const result = await Swal.fire({
      title: '¿Borrar selección confirmada?',
      html: `Tu selección actual será <strong>eliminada por completo</strong>.<br>Podrás volver a elegir tus fotos desde cero.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, borrar selección',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      backdrop: true
    });
    if (!result.isConfirmed) return;
    try {
      const response = await fetch(`${API_URL}/user/cancelSelection`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ galleryId: currentGalleryId })
      });
      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Selección eliminada');
        localStorage.removeItem(storageKey(currentGalleryId));
        fetchGalleries();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cancelar la selección');
      }
    } catch (error) {
      toast.error(error.message || 'Error al cancelar la selección');
    }
  };

  const filteredImages = processedImages.filter(image => selectedImages.has(image.id));

  const displayedImages = (() => {
    let imgs = [...processedImages];

    // Ordenamiento
    if (sortBy === 'date-new') imgs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    else if (sortBy === 'date-old') imgs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    // Filtrar por orientación (usa mapa lazy; horizontal incluye imágenes aún no cargadas)
    if (filterOrientation === 'vertical') imgs = imgs.filter(img => imageOrientations.current.get(img.id) === true);
    else if (filterOrientation === 'horizontal') imgs = imgs.filter(img => imageOrientations.current.get(img.id) !== true);
    if (filterStatus === 'selected') imgs = imgs.filter(img => selectedImages.has(img.id));
    else if (filterStatus === 'unselected') imgs = imgs.filter(img => !selectedImages.has(img.id));
    return imgs;
  })();

  if (loading) {
    return (
      <div className="gallery-loading">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        <p>Cargando galerías...</p>
      </div>
    );
  }

  if (!galleriesData || galleriesData.length === 0) {
    return (
      <div className="gallery-empty">
        <FontAwesomeIcon icon={faImages} size="4x" />
        <h3>Aún no tienes galerías disponibles</h3>
        <p>Tu fotógrafo te notificará cuando tus galerías estén listas</p>
      </div>
    );
  }

  return (
    <div className="galeria-container">

      {currentGallery && (
        <header className="galeria-header">
          <div className="galeria-header-content">
            <div className="galeria-header-main">
              <div className="galeria-navigation">
                <div className="galeria-title-section">
                  <h1>{currentGallery.gallery.title}</h1>
                  <p className="galeria-service">{currentGallery.gallery.service_type}</p>
                  {galleriesData.length > 1 && galleriesData.length <= 12 && (
                    <div className="galeria-nav-dots">
                      {galleriesData.map((g, idx) => (
                        <button
                          key={idx}
                          className={`galeria-nav-dot${idx === currentGalleryIndex ? ' active' : ''}`}
                          onClick={() => setCurrentGalleryIndex(idx)}
                          title={g.gallery?.title}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="galeria-header-meta">
              <div className="galeria-meta-left">
                <span className="galeria-client">{user?.first_name} {user?.last_name}</span>
                <span className="galeria-count">{currentGallery.images?.length || 0} fotos</span>
              </div>
              <div className="galeria-counter">
                {galleriesData.length > 1 && (
                  <button className="nav-arrow-ghost" onClick={() => navigateGallery(-1)} title="Galería anterior">
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                )}
                <span className="gallery-counter-text">Galería {currentGalleryIndex + 1} de {galleriesData.length}</span>
                {galleriesData.length > 1 && (
                  <button className="nav-arrow-ghost" onClick={() => navigateGallery(1)} title="Siguiente galería">
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Estado de selección dentro del header */}
          {selectionLocked ? (
            <div className={`ghs-locked ${videoReady ? 'ghs-locked--ready' : ''}`}>
              <div className="ghs-row">
                {videoReady ? (
                  <>
                    <div className="ghs-info">
                      <FontAwesomeIcon icon={faVideo} className="ghs-icon ghs-icon--green" />
                      <span className="ghs-label">¡Tu video ya está disponible!</span>
                      <span className="ghs-desc">Podés verlo y descargarlo en la sección Mis Videos</span>
                    </div>
                    <button className="sel-btn sel-btn--primary" onClick={() => setActiveSection?.('videos')}>
                      <FontAwesomeIcon icon={faVideo} /> Ver Mis Videos
                    </button>
                  </>
                ) : (
                  <>
                    <div className="ghs-info">
                      <FontAwesomeIcon icon={faCheckCircle} className="ghs-icon ghs-icon--green" />
                      <span className="ghs-label">Selección confirmada</span>
                      <span className="ghs-desc">Tu fotógrafo ya recibió tu elección de fotos</span>
                    </div>
                    <button className="sel-btn sel-btn--danger" onClick={cancelSelectionByClient}>
                      <FontAwesomeIcon icon={faTrash} /> Borrar selección
                    </button>
                  </>
                )}
              </div>
              {songSelection && (
                <div className="ghs-row ghs-row--songs">
                  <div className="ghs-info">
                    <span className="ghs-icon">🎵</span>
                    <span className="ghs-label">Canciones</span>
                    <span className="ghs-desc">
                      {songSelection.let_admin_choose
                        ? 'El equipo de Pantone las elegirá'
                        : [songSelection.song_1, songSelection.song_2, songSelection.song_3].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : selectedImages.size > 0 && (
            <div className="ghs-selecting">
              <div className="ghs-row">
                <div className="ghs-info">
                  <FontAwesomeIcon icon={faCheckCircle} className="ghs-icon ghs-icon--orange" />
                  <span className="ghs-label">
                    {selectedImages.size} imagen{selectedImages.size !== 1 ? 'es' : ''} seleccionada{selectedImages.size !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="ghs-actions">
                  <button className="sel-btn sel-btn--primary" onClick={confirmSelection}>
                    <FontAwesomeIcon icon={faCheckCircle} /> Confirmar
                  </button>
                  <button className="sel-btn sel-btn--secondary" onClick={downloadSelected} disabled={downloading}>
                    {downloading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faDownload} />}
                    Descargar
                  </button>
                  <button className="sel-btn sel-btn--ghost" onClick={previewSelected}>
                    <FontAwesomeIcon icon={faEye} /> Previsualizar
                  </button>
                  <button className="sel-btn sel-btn--danger" onClick={clearSelection}>
                    <FontAwesomeIcon icon={faTimes} /> Limpiar
                  </button>
                </div>
              </div>
            </div>
          )}
        </header>
      )}

      {processedImages.length > 0 && (
        <div className="gal-filters">
          <div className="gal-filter-group">
            <span className="gal-filter-label">Orientación</span>
            <div className="gal-filter-pills">
              {[['all','Todas'],['vertical','Vertical'],['horizontal','Horizontal']].map(([val, label]) => (
                <button key={val} className={`gal-pill${filterOrientation === val ? ' active' : ''}`} onClick={() => setFilterOrientation(val)}>{label}</button>
              ))}
            </div>
          </div>
          <div className="gal-filter-group">
            <span className="gal-filter-label">Estado</span>
            <div className="gal-filter-pills">
              {[['all','Todas'],['selected','Seleccionadas'],['unselected','Sin seleccionar']].map(([val, label]) => (
                <button key={val} className={`gal-pill${filterStatus === val ? ' active' : ''}`} onClick={() => setFilterStatus(val)}>{label}</button>
              ))}
            </div>
          </div>
          <div className="gal-filter-group">
            <span className="gal-filter-label">Orden</span>
            <div className="gal-filter-pills">
              {[['default','Por defecto'],['date-new','Más nuevas'],['date-old','Más antiguas']].map(([val, label]) => (
                <button key={val} className={`gal-pill${sortBy === val ? ' active' : ''}`} onClick={() => setSortBy(val)}>{label}</button>
              ))}
            </div>
          </div>
          {(filterOrientation !== 'all' || filterStatus !== 'all') && (
            <span className="gal-filter-count">
              {displayedImages.filter(img => !img._dimmed).length} de {processedImages.length} fotos destacadas
            </span>
          )}
          {(filterOrientation !== 'all' || filterStatus !== 'all' || sortBy !== 'default') && (
            <button className="gal-filter-reset" onClick={() => { setFilterOrientation('all'); setFilterStatus('all'); setSortBy('default'); }}>
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      <main className="galeria-main">
        <div className="galeria-grid">
          {displayedImages.length > 0 ? (
            displayedImages.map((image, index) => {
              const isVertical = imageOrientations.current.get(image.id) === true;
              const isFeatured = !isVertical && index % FEATURE_INTERVAL === 4;
              return (
              <div key={image.id} className={`galeriaFotos-container-imagen ${isVertical ? 'vertical' : 'horizontal'}${isFeatured ? ' featured' : ''}${selectedImages.has(image.id) ? ' selected-container' : ''}`}>
                <div className={`galeria-item ${selectedImages.has(image.id) ? 'selected' : ''}`} onClick={(e) => handleImageClick(image, index, e)}>
                  <LazyImage
                    imageId={image.id}
                    src={image.image_url}
                    alt={image.original_filename}
                    onOrientationDetected={handleOrientationDetected}
                  />
                  <div className="galeria-item-overlay">
                    {!selectionLocked && (
                      <button className={`check-btn ${selectedImages.has(image.id) ? 'checked' : ''}`} onClick={(e) => toggleImageSelection(image.id, e)}>
                        <FontAwesomeIcon icon={faCheckCircle} />
                      </button>
                    )}
                    <button className="zoom-btn" onClick={(e) => handleZoomClick(image, index, e)}>
                      <FontAwesomeIcon icon={faSearchPlus} />
                    </button>
                    <button className="download-single-btn" onClick={(e) => {
                      e.stopPropagation();
                      downloadSingleImage(image.id, image.image_url, image.original_filename);
                    }} title="Descargar esta imagen">
                      <FontAwesomeIcon icon={faDownload} />
                    </button>
                    <button className="check-btn" onClick={(e) => handleCommentsClick(image, e)} title="Agregar comentario">
                      <FontAwesomeIcon icon={faComment} />
                    </button>
                  </div>
                  {selectedImages.has(image.id) && (
                    <div className="selection-badge">
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </div>
                  )}
                </div>
              </div>
              );
            })
          ) : (
            <div className="no-images-message">
              <FontAwesomeIcon icon={faImages} size="3x" />
              <p>{currentGallery?.images?.length === 0 ? 'No hay imágenes en esta galería' : 'Ninguna imagen coincide con los filtros'}</p>
            </div>
          )}
        </div>
      </main>
      
      {/* Preview de Imágenes Seleccionadas */}
      {showPreview && (
        <div className="preview-overlay" onClick={closePreview}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h2>Vista Previa de Seleccionadas</h2>
              <div className="preview-header-info">
                <span className="preview-count">
                  {selectedImages.size} imagen{selectedImages.size !== 1 ? 'es' : ''} seleccionada{selectedImages.size !== 1 ? 's' : ''}
                </span>
                <span className="preview-gallery">
                  - {currentGallery?.gallery?.title}
                </span>
                <button className="preview-close" onClick={closePreview}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>
            <div className="preview-grid">
              {filteredImages.map((image) => (
                <div key={image.id} className="preview-item">
                  <div className="preview-image-container">
                    <img src={image.image_url} alt={image.original_filename} className="preview-img" loading="lazy" decoding="async" onClick={() => {
                      setOverlayImage(image);
                      setOverlayIndex(displayedImages.findIndex(img => img.id === image.id));
                      setOverlayVisible(true);
                      setShowPreview(false);
                    }} />
                    <button className={`preview-check-btn ${selectedImages.has(image.id) ? 'checked' : ''}`} onClick={(e) => {
                      e.stopPropagation();
                      toggleImageSelection(image.id);
                    }}>
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </button>
                  </div>
                  <div className="preview-info">
                    <span className="preview-filename">{image.original_filename}</span>
                    <button className="preview-download-btn" onClick={(e) => {
                      e.stopPropagation();
                      downloadSingleImage(image.id, image.image_url, image.original_filename);
                    }} title="Descargar esta imagen">
                      <FontAwesomeIcon icon={faDownload} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="preview-actions">
              <button className="preview-confirm-btn" onClick={confirmSelection}>
                <FontAwesomeIcon icon={faCheckCircle} /> Confirmar Selección
              </button>
              <button className="preview-download-all-btn" onClick={downloadSelected}>
                <FontAwesomeIcon icon={faDownload} /> Descargar Todas
              </button>
              <button className="preview-clear-btn" onClick={clearSelection}>
                Limpiar Selección
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showScrollTop && (
        <button className="scroll-top-btn" onClick={scrollToTop}>
          <FontAwesomeIcon icon={faArrowUp} />
        </button>
      )}
      
      {overlayVisible && overlayImage && (
        <div className="overlay" onClick={handleOverlayClose}>
          <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
            <button className="overlay-close" onClick={handleOverlayClose}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <div className="overlay-image-container">
              <img src={overlayImage.image_url} alt={overlayImage.original_filename} className="overlay-image" />
              <button className={`overlay-check ${selectedImages.has(overlayImage.id) ? 'checked' : ''}`} onClick={(e) => handleOverlayImageClick(overlayImage.id, e)}>
                <FontAwesomeIcon icon={faCheckCircle} />
              </button>
              <button className="overlay-download-btn" onClick={(e) => {
                e.stopPropagation();
                downloadSingleImage(overlayImage.id, overlayImage.image_url, overlayImage.original_filename);
              }} title="Descargar esta imagen">
                <FontAwesomeIcon icon={faDownload} />
              </button>

              <div className="overlay-navigation">
                <button onClick={() => navigateOverlay(-1)} className="nav-btn prev">
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button onClick={() => navigateOverlay(1)} className="nav-btn next">
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            </div>
            <div className="overlay-info">
              <span className="overlay-counter">{overlayIndex + 1} / {displayedImages.length}</span>
              <span className="overlay-gallery">{currentGallery?.gallery?.title}</span>
            </div>
          </div>
        </div>
      )}
      
      <ImageCommentsOverlay 
        image={commentsImage} 
        isOpen={showCommentsOverlay} 
        onClose={handleCommentsOverlayClose}
        galleryId={currentGalleryId}
      />
      
      <SongSelectionModal
        isOpen={showSongModal}
        onClose={() => setShowSongModal(false)}
        onConfirm={handleSongConfirm}
        imageCount={selectedImages.size}
        galleryTitle={currentGallery?.gallery?.title || ''}
        loading={confirmingSelection}
      />
    </div>
  );
};

export default Gallery;