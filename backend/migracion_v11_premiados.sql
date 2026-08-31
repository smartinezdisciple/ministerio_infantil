-- migracion_v11_premiados.sql
-- Modulo "Premiados": registro manual del mejor estudiante de cada grupo por turno
-- en el ultimo domingo / miercoles del mes.
-- Un unico premiado por (Mes, ID_Turno, ID_Grupo) -> 1 nino por grupo por turno por mes.

CREATE TABLE IF NOT EXISTS Premiados (
    ID_Premiado      SERIAL      PRIMARY KEY,
    Mes              DATE        NOT NULL,                -- primer dia del mes (YYYY-MM-01)
    Fecha_Premiacion DATE        NOT NULL,                -- ultimo domingo / miercoles real del mes
    ID_Turno         INT         NOT NULL REFERENCES Turnos(ID_Turno),
    ID_Grupo         INT         NOT NULL REFERENCES Grupos(ID_Grupo),
    ID_Nino          INT         NOT NULL REFERENCES Ninos(ID_Persona),
    ID_Registrado_Por INT        NOT NULL REFERENCES Personal_Sistema(ID_Persona),
    Creado_En        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_premiado_mes_turno_grupo UNIQUE (Mes, ID_Turno, ID_Grupo)
);

CREATE INDEX IF NOT EXISTS idx_premiados_mes        ON Premiados (Mes DESC);
CREATE INDEX IF NOT EXISTS idx_premiados_nino       ON Premiados (ID_Nino);
CREATE INDEX IF NOT EXISTS idx_premiados_turno_grupo ON Premiados (ID_Turno, ID_Grupo);
