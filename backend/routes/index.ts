// Référence centralisée des endpoints de l'API REST
// (La définition effective des routes est dans src/app/api/ — App Router Next.js)
// Ce fichier sert de documentation et de contrat pour les contrôleurs.

export const API_ROUTES = {
  auth: {
    register: '/api/auth/register', // POST
    login:    '/api/auth/login',    // POST
    logout:   '/api/auth/logout',   // POST
    me:       '/api/auth/me',       // GET (protégé)
  },
  beats: {
    list:   '/api/beats',           // GET (public, ?style= &page= &limit=)
    detail: '/api/beats/:id',       // GET (public)
    create: '/api/beats',           // POST (protégé)
    update: '/api/beats/:id',       // PUT (protégé + owner)
    delete: '/api/beats/:id',       // DELETE (protégé + owner)
  },
  licenses: {
    listByBeat: '/api/beats/:id/licenses',  // GET (public)
    create:     '/api/beats/:id/licenses',  // POST (protégé + owner)
    update:     '/api/licenses/:id',        // PUT (protégé + owner)
    delete:     '/api/licenses/:id',        // DELETE (protégé + owner)
  },
} as const;