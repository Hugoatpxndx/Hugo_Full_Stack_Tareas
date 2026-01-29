
// PARTE 1: AQUÍ DEFINO CÓMO SON LAS CLASES

class Tarea {
    constructor(nombre, completa = false) {
        this.id = Date.now(); // Uso la hora actual para tener un ID único
        this.nombre = nombre;
        this.completa = completa;
    }

    toggleEstado() {
        this.completa = !this.completa;
    }

    editarNombre(nuevoNombre) {
        this.nombre = nuevoNombre;
    }
}

class GestorDeTareas {
    constructor() {
        // Al iniciar, intento recuperar las tareas que guardamos en el navegador para no perderlas
        const guardado = JSON.parse(localStorage.getItem('misTareas'));
        this.tareas = guardado ? guardado.map(t => {
            const nueva = new Tarea(t.nombre, t.completa);
            nueva.id = t.id;
            return nueva;
        }) : [];
    }

    agregar(nombre) {
        const nueva = new Tarea(nombre); // Creo la tarea nueva
        this.tareas.push(nueva); // La meto en la lista
        this.guardar(); // Y guardo todo
    }

    eliminar(id) {
        this.tareas = this.tareas.filter(t => t.id !== id); // Filtro la lista para dejar fuera la tarea que quiero borrar
        this.guardar();
    }

    toggleEstado(id) {
        const tarea = this.tareas.find(t => t.id === id);
        if (tarea) {
            tarea.toggleEstado();
            this.guardar();
        }
    }

    editar(id, nuevoNombre) {
        const tarea = this.tareas.find(t => t.id === id);
        if (tarea) {
            tarea.editarNombre(nuevoNombre);
            this.guardar();
        }
    }

    obtenerTodas() {
        return this.tareas;
    }

    guardar() {
        localStorage.setItem('misTareas', JSON.stringify(this.tareas)); // Guardo la lista en el navegador
    }
}

// PARTE 2: AQUÍ CONTROLO LA INTERFAZ.

const gestor = new GestorDeTareas();

// Aquí guardo las referencias a los elementos de la página para poder usarlos después
const inputTarea = document.getElementById('nueva-tarea');
const btnAgregar = document.getElementById('agregar-tarea');
const listaTareas = document.getElementById('lista-tareas');
const msgError = document.getElementById('mensaje-error');

function renderizar() {
    listaTareas.innerHTML = ''; // Primero borro todo lo que hay en la lista visualmente para volver a dibujarla desde cero
    
    gestor.obtenerTodas().forEach(tarea => {
        const li = document.createElement('li');
        if (tarea.completa) li.classList.add('completada'); // Si está completa, le pongo una clase especial para tacharla

        li.innerHTML = `
            <!-- Aquí pongo el texto de la tarea y el icono que cambia si está lista o no -->
            <span style="cursor:pointer; flex-grow:1;">
                ${tarea.completa ? '✅' : '⬜'} ${tarea.nombre}
            </span>
            <!-- En este div agrupo los botones para que se mantengan juntos -->
            <div>
                <!-- Agrego aria-label para que los lectores de pantalla digan específicamente qué tarea se va a editar o borrar -->
                <button class="btn-editar" aria-label="Editar tarea ${tarea.nombre}">Editar</button>
                <button class="btn-eliminar" aria-label="Eliminar tarea ${tarea.nombre}">Eliminar</button>
            </div>
        `;

        // Aquí le digo que si hacen clic en el texto, marque la tarea como completada o pendiente
        li.querySelector('span').addEventListener('click', () => {
            gestor.toggleEstado(tarea.id);
            renderizar();
        });

        // Configuro el botón de editar para pedir el nuevo nombre
        li.querySelector('.btn-editar').addEventListener('click', () => {
            const nuevoNombre = prompt("Editar tarea:", tarea.nombre);
            if (nuevoNombre && nuevoNombre.trim() !== "") {
                gestor.editar(tarea.id, nuevoNombre.trim());
                renderizar();
            }
        });

        // Configuro el botón de eliminar con una confirmación por si acaso
        li.querySelector('.btn-eliminar').addEventListener('click', () => {
            if (confirm("¿Borrar esta tarea?")) {
                gestor.eliminar(tarea.id);
                renderizar();
            }
        });

        listaTareas.appendChild(li);
    });
}

// Cuando hacen clic en "Agregar", tomo el texto y creo la tarea
btnAgregar.addEventListener('click', () => {
    const texto = inputTarea.value.trim();
    
    if (texto === "") {
        msgError.classList.remove('oculto'); // Si está vacío, muestro el mensaje de error
        return;
    }
    
    msgError.classList.add('oculto'); // Si todo está bien, escondo el error
    gestor.agregar(texto);
    inputTarea.value = ''; // Limpio el campo de texto
    renderizar(); // Actualizo la lista en pantalla
});

// También permito agregar presionando la tecla Enter
inputTarea.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') btnAgregar.click();
});

// Al cargar la página, dibujo las tareas que ya existían
renderizar();