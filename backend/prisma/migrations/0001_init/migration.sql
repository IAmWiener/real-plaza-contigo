-- Migración inicial de Real Plaza Contigo.
-- Habilita PostGIS, crea las tablas del dominio y añade las columnas
-- geoespaciales `geom geography(Point,4326)` con sus índices GIST.

-- 1) Extensión geoespacial.
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2) Tablas del dominio.
CREATE TABLE "empresas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "distrito" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "categorias" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "icono" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "eventos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "estado" TEXT NOT NULL,
    "zona_afectada" TEXT NOT NULL,
    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "puntos_acopio" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "sede_id" TEXT NOT NULL,
    "evento_id" TEXT,
    "direccion" TEXT NOT NULL,
    "distrito" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "horario" TEXT NOT NULL,
    "contacto_nombre" TEXT NOT NULL,
    "contacto_telefono" TEXT NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "ocupacion" INTEGER NOT NULL,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "observaciones" TEXT NOT NULL,
    CONSTRAINT "puntos_acopio_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "recursos" (
    "id" TEXT NOT NULL,
    "punto_acopio_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "unidad" TEXT NOT NULL,
    "cantidad_disponible" INTEGER NOT NULL,
    "cantidad_comprometida" INTEGER NOT NULL,
    "estado" TEXT NOT NULL,
    CONSTRAINT "recursos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "puntos_riesgo" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "severidad" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "radio_metros" INTEGER NOT NULL,
    "distrito" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "reportado_en" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "puntos_riesgo_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "categorias_puntos" (
    "punto_acopio_id" TEXT NOT NULL,
    "categoria_id" TEXT NOT NULL,
    CONSTRAINT "categorias_puntos_pkey" PRIMARY KEY ("punto_acopio_id","categoria_id")
);

CREATE TABLE "aliados_puntos" (
    "punto_acopio_id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    CONSTRAINT "aliados_puntos_pkey" PRIMARY KEY ("punto_acopio_id","empresa_id")
);

-- 3) Índices de claves foráneas.
CREATE INDEX "puntos_acopio_sede_id_idx" ON "puntos_acopio"("sede_id");
CREATE INDEX "puntos_acopio_evento_id_idx" ON "puntos_acopio"("evento_id");
CREATE INDEX "recursos_punto_acopio_id_idx" ON "recursos"("punto_acopio_id");

-- 4) Claves foráneas.
ALTER TABLE "puntos_acopio" ADD CONSTRAINT "puntos_acopio_sede_id_fkey"
    FOREIGN KEY ("sede_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "puntos_acopio" ADD CONSTRAINT "puntos_acopio_evento_id_fkey"
    FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "recursos" ADD CONSTRAINT "recursos_punto_acopio_id_fkey"
    FOREIGN KEY ("punto_acopio_id") REFERENCES "puntos_acopio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "categorias_puntos" ADD CONSTRAINT "categorias_puntos_punto_acopio_id_fkey"
    FOREIGN KEY ("punto_acopio_id") REFERENCES "puntos_acopio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "categorias_puntos" ADD CONSTRAINT "categorias_puntos_categoria_id_fkey"
    FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "aliados_puntos" ADD CONSTRAINT "aliados_puntos_punto_acopio_id_fkey"
    FOREIGN KEY ("punto_acopio_id") REFERENCES "puntos_acopio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "aliados_puntos" ADD CONSTRAINT "aliados_puntos_empresa_id_fkey"
    FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 5) Columnas geoespaciales PostGIS + índices GIST.
--    Se gestionan fuera del modelo Prisma (tipo no soportado nativamente) y
--    se mantienen actualizadas por los servicios y el seed con ST_MakePoint.
ALTER TABLE "puntos_acopio" ADD COLUMN "geom" geography(Point, 4326);
ALTER TABLE "puntos_riesgo" ADD COLUMN "geom" geography(Point, 4326);

CREATE INDEX "puntos_acopio_geom_idx" ON "puntos_acopio" USING GIST ("geom");
CREATE INDEX "puntos_riesgo_geom_idx" ON "puntos_riesgo" USING GIST ("geom");
