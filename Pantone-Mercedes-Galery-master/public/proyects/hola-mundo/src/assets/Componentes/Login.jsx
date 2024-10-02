import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
export function Login({setAcceso}) {

    const navigate = useNavigate(); 

    useEffect(() => {
        const accesoGuardado = localStorage.getItem("acceso");
        if (accesoGuardado === "11134") {
          setAcceso(true);
          navigate(`/inicio`);
        }
      }, [navigate, setAcceso]);
    function handleSubmit(e) {
        e.preventDefault();
        const password = e.target[0].value;
        console.log(password)
        if (password === "asdf1214fsa") {
            console.log("acceso")
            localStorage.setItem("acceso", "11134");
            setAcceso(true);
            navigate(`/inicio`);
        } else {
        }
    }

    return (
        <div>
            <h2>404 ERROR</h2>
            <h3>Page not found</h3>
            <p>Sorry, the page you are looking for does not exist.</p>

            <form onSubmit={handleSubmit}>
                <input type="password" placeholder="Password" />
                <button type="submit">Login</button>
            </form>

        </div>
    )
}