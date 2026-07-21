graph TD
%% Definición de Estilos
classDef origen fill:#f9f,stroke:#333,stroke-width:2px;
classDef imp fill:#fff3cd,stroke:#ffc107,stroke-width:2px;
classDef cs fill:#d1ecf1,stroke:#17a2b8,stroke-width:2px;
classDef accion fill:#e2e3e5,stroke:#6c757d,stroke-width:2px,stroke-dasharray: 5 5;
classDef baja fill:#f8d7da,stroke:#dc3545,stroke-width:2px;

    %% Nodos Iniciales / Orígenes
    Inicio([Inicio de Ciclo de Vida]) --> Origen{¿Cuál es el Origen?}

    %% Rama Importación Excel
    Origen -->|Importación Excel| Imp_Estado{Estado Inicial}
    Imp_Estado -->|Inhabilitado| Imp_Inhabilitado[Imp: Inhabilitado]
    Imp_Estado -->|Habilitado| Imp_Habilitado[Imp: Habilitado]

    %% Transición de Importados a ClicSalud
    Imp_Habilitado --> TramiteAlta[Trámite de Alta Digital]:::accion
    TramiteAlta -->|Trámite Cerrado y Aprobado| CS_Habilitado[CS: Habilitado]

    %% Rama Origen Oficial ClicSalud
    Origen -->|Origen ClicSalud| CS_Habilitado

    %% Flujo Central y Estados de ClicSalud
    CS_Habilitado -->|Falta Grave / Sanción o Vencido| CS_Inhabilitado[CS: Inhabilitado]
    CS_Inhabilitado -->|Subanación de observaciones| CS_Habilitado

    %% Fin de Ciclo (Baja)
    Imp_Inhabilitado -->|Cierre Definitivo / Legado| CS_Baja[CS: BAJA]:::baja
    CS_Inhabilitado -->|Cierre Comercial o Sanción Firme| CS_Baja
    CS_Habilitado -->|Cierre Voluntario| CS_Baja

    %% Aplicación de Clases
    class Origen origen;
    class Imp_Estado,Imp_Habilitado,Imp_Inhabilitado imp;
    class CS_Habilitado,CS_Inhabilitado cs;
