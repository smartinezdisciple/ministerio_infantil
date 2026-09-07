-- migracion_v12_liga_biblica.sql
-- Modulo "Liga Biblica" (septiembre 2026): registro de ninos inscritos a la liga
-- biblica, con el turno en el que fueron inscritos (según el usuario que los
-- ingresa) y el tutor unico seleccionado para recibir la guia de estudio.
-- Un unico registro por (Fecha_Liga, ID_Turno, ID_Nino).

CREATE TABLE IF NOT EXISTS Liga_Biblica (
    ID_Liga           SERIAL      PRIMARY KEY,
    Fecha_Liga        DATE        NOT NULL,                -- dia de la liga (2026-09-27 domingo | 2026-09-30 miercoles)
    ID_Turno          INT         NOT NULL REFERENCES Turnos(ID_Turno),
    ID_Nino           INT         NOT NULL REFERENCES Ninos(ID_Persona),
    ID_Tutor          INT         NOT NULL REFERENCES Tutores(ID_Persona),
    ID_Registrado_Por INT         NOT NULL REFERENCES Personal_Sistema(ID_Persona),
    Creado_En         TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_liga_fecha_turno_nino UNIQUE (Fecha_Liga, ID_Turno, ID_Nino)
);

CREATE INDEX IF NOT EXISTS idx_liga_biblica_fecha ON Liga_Biblica (Fecha_Liga DESC);
CREATE INDEX IF NOT EXISTS idx_liga_biblica_nino  ON Liga_Biblica (ID_Nino);