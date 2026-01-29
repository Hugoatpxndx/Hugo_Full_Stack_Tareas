class Tarea {
    constructor(nombre, completa = false) {
        this.id = Date.now(); // Aquí uso la fecha actual para crear un ID único para que no se repitan
        this.nombre = nombre;
        this.completa = completa;
    }

    toggleEstado() {
        this.completa = !this.completa; // Aquí invierto el valor: si era true pasa a false y al revés
    }

    editarNombre(nuevoNombre) {
        this.nombre = nuevoNombre; // Aquí simplemente actualizo el nombre de la tarea
    }
}

export class GestorDeTareas {
    constructor() {
        // Aquí intento recuperar las tareas que guardamos antes en el navegador para que no se pierdan al recargar
        const tareasGuardadas = JSON.parse(localStorage.getItem('misTareas'));
        // Si encontré tareas guardadas, las convierto de nuevo en objetos de tipo Tarea, si no, empiezo con una lista vacía
        this.tareas = tareasGuardadas ? tareasGuardadas.map(t => {
            const tareaObj = new Tarea(t.nombre, t.completa);
            tareaObj.id = t.id; // Le vuelvo a poner el mismo ID que tenía antes para no perder la referencia
            return tareaObj;
        }) : [];
    }

    agregar(nombre) {
        const nueva = new Tarea(nombre); // Creo la nueva tarea con el nombre que me pasaron
        this.tareas.push(nueva); // La agrego a mi lista de tareas
        this.guardar(); // Y aquí guardo todo en el navegador para que se actualice la lista guardada
        return nueva;
    }

    eliminar(id) {
        // Aquí uso filter para crear una lista nueva que tenga todas las tareas MENOS la que quiero borrar
        this.tareas = this.tareas.filter(t => t.id !== id);
        this.guardar(); // Guardo la nueva lista sin la tarea borrada
    }

    toggleEstado(id) {
        const tarea = this.tareas.find(t => t.id === id); // Busco la tarea específica por su ID
        if (tarea) {
            tarea.toggleEstado(); // Si la encuentro, le cambio el estado
            this.guardar(); // Y guardo los cambios
            return true;
        }
        return false;
    }

    editar(id, nuevoNombre) {
        const tarea = this.tareas.find(t => t.id === id); // Primero busco la tarea que queremos editar
        // Verifico que la tarea exista y que el nuevo nombre no esté vacío
        if (tarea && nuevoNombre.trim() !== "") {
            tarea.editarNombre(nuevoNombre.trim()); // Le cambio el nombre
            this.guardar(); // Guardo la actualización
            return true;
        }
        return false;
    }

    obtenerTodas() {
        return this.tareas; // Aquí simplemente devuelvo la lista completa de tareas
    }

    // Esta función se encarga de guardar la lista actual de tareas en el LocalStorage del navegador
    guardar() {
        localStorage.setItem('misTareas', JSON.stringify(this.tareas));
    }
}