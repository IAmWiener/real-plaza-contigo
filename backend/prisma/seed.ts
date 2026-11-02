/**
 * Semillas (seeds) de Real Plaza Contigo.
 *
 * Carga los datos iniciales de demostración —idénticos a los mocks del
 * frontend— y sincroniza la columna PostGIS `geom` de cada punto. Es
 * idempotente: limpia las tablas antes de insertar para poder re-ejecutarse.
 *
 * IMPORTANTE: TODOS los datos son FICTICIOS y de DEMOSTRACIÓN. No representan
 * sedes, aliados, eventos, emergencias ni ubicaciones reales de Real Plaza.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const empresas = [
  { id: 'sede-salaverry', nombre: 'Real Plaza Salaverry', tipo: 'sede', ruc: '20100000011', distrito: 'Jesús María', telefono: '(01) 500-0011' },
  { id: 'sede-primavera', nombre: 'Real Plaza Primavera', tipo: 'sede', ruc: '20100000022', distrito: 'San Borja', telefono: '(01) 500-0022' },
  { id: 'sede-centro-civico', nombre: 'Real Plaza Centro Cívico', tipo: 'sede', ruc: '20100000033', distrito: 'Cercado de Lima', telefono: '(01) 500-0033' },
  { id: 'sede-pro', nombre: 'Real Plaza Pro', tipo: 'sede', ruc: '20100000044', distrito: 'Los Olivos', telefono: '(01) 500-0044' },
  { id: 'sede-plaza-norte', nombre: 'Real Plaza Plaza Norte (ref.)', tipo: 'sede', ruc: '20100000055', distrito: 'Independencia', telefono: '(01) 500-0055' },
  { id: 'sede-san-miguel', nombre: 'Real Plaza San Miguel', tipo: 'sede', ruc: '20100000066', distrito: 'San Miguel', telefono: '(01) 500-0066' },
  { id: 'sede-cajamarca', nombre: 'Real Plaza Guardia Civil (ref.)', tipo: 'sede', ruc: '20100000077', distrito: 'Chorrillos', telefono: '(01) 500-0077' },
  { id: 'sede-puruchuco', nombre: 'Real Plaza Puruchuco', tipo: 'sede', ruc: '20100000088', distrito: 'Ate', telefono: '(01) 500-0088' },
  { id: 'aliado-cruz-apoyo', nombre: 'Aliado Cruz de Apoyo', tipo: 'aliado', ruc: '20200000011', distrito: 'Miraflores', telefono: '(01) 700-0011' },
  { id: 'aliado-manos-unidas', nombre: 'Aliado Manos Unidas', tipo: 'aliado', ruc: '20200000022', distrito: 'San Isidro', telefono: '(01) 700-0022' },
  { id: 'aliado-red-solidaria', nombre: 'Aliado Red Solidaria', tipo: 'aliado', ruc: '20200000033', distrito: 'Comas', telefono: '(01) 700-0033' },
];

const categorias = [
  { id: 'cat-alimentos', nombre: 'Alimentos', icono: 'Apple', descripcion: 'Alimentos no perecibles y comida preparada.' },
  { id: 'cat-agua', nombre: 'Agua potable', icono: 'Droplets', descripcion: 'Agua embotellada y bidones.' },
  { id: 'cat-salud', nombre: 'Salud y primeros auxilios', icono: 'HeartPulse', descripcion: 'Medicinas e insumos de primeros auxilios.' },
  { id: 'cat-ropa', nombre: 'Ropa y abrigo', icono: 'Shirt', descripcion: 'Ropa, frazadas y abrigo.' },
  { id: 'cat-refugio', nombre: 'Refugio temporal', icono: 'Tent', descripcion: 'Carpas y espacios de alojamiento temporal.' },
  { id: 'cat-higiene', nombre: 'Higiene', icono: 'ShowerHead', descripcion: 'Kits de aseo e higiene personal.' },
  { id: 'cat-rescate', nombre: 'Rescate y asistencia', icono: 'LifeBuoy', descripcion: 'Equipos de rescate y asistencia logística.' },
];

const eventos = [
  { id: 'evt-inundacion-rimac', nombre: 'Inundación zona ribereña del Rímac', tipo: 'inundacion', descripcion: 'Desborde ficticio del río que afecta zonas aledañas. Escenario de demostración.', fechaInicio: new Date('2026-10-21T08:00:00.000Z'), estado: 'activo', zonaAfectada: 'Cercado de Lima / San Martín de Porres' },
  { id: 'evt-sismo-lima', nombre: 'Sismo moderado Lima Metropolitana', tipo: 'sismo', descripcion: 'Simulación de sismo de magnitud moderada con daños localizados.', fechaInicio: new Date('2026-10-18T14:30:00.000Z'), estado: 'monitoreo', zonaAfectada: 'Lima Metropolitana' },
  { id: 'evt-deslizamiento-comas', nombre: 'Deslizamiento en laderas de Comas', tipo: 'deslizamiento', descripcion: 'Deslizamiento ficticio en zonas de ladera tras lluvias.', fechaInicio: new Date('2026-10-24T05:15:00.000Z'), estado: 'activo', zonaAfectada: 'Comas / Los Olivos' },
  { id: 'evt-lluvias-norte', nombre: 'Lluvias intensas Lima Norte', tipo: 'lluvias_intensas', descripcion: 'Emergencia simulada por lluvias intensas en Lima Norte.', fechaInicio: new Date('2026-10-26T20:00:00.000Z'), estado: 'activo', zonaAfectada: 'Los Olivos / San Martín de Porres' },
  { id: 'evt-sismo-callao', nombre: 'Sismo réplica zona oeste', tipo: 'sismo', descripcion: 'Réplica simulada posterior al sismo principal.', fechaInicio: new Date('2026-10-19T09:45:00.000Z'), estado: 'cerrado', zonaAfectada: 'San Miguel / Cercado de Lima' },
];

type SeedPunto = {
  id: string; codigo: string; nombre: string; estado: string;
  categoriaIds: string[]; sedeId: string; aliadoIds: string[]; eventoId: string | null;
  direccion: string; distrito: string; lat: number; lng: number; horario: string;
  contactoNombre: string; contactoTelefono: string; capacidad: number; ocupacion: number;
  actualizadoEn: string; observaciones: string;
};

const puntosAcopio: SeedPunto[] = [
  { id: 'pa-001', codigo: 'RPC-JM-01', nombre: 'Acopio Salaverry Central', estado: 'operativo', categoriaIds: ['cat-alimentos', 'cat-agua', 'cat-higiene'], sedeId: 'sede-salaverry', aliadoIds: ['aliado-manos-unidas'], eventoId: 'evt-inundacion-rimac', direccion: 'Av. Gral. Salaverry 2370', distrito: 'Jesús María', lat: -12.0897, lng: -77.0520, horario: 'L-D 07:00-21:00', contactoNombre: 'Ana Quispe', contactoTelefono: '999-000-001', capacidad: 500, ocupacion: 180, actualizadoEn: '2026-10-29T18:00:00.000Z', observaciones: 'Recepción activa de alimentos no perecibles.' },
  { id: 'pa-002', codigo: 'RPC-CL-02', nombre: 'Acopio Centro Cívico', estado: 'capacidad_limitada', categoriaIds: ['cat-ropa', 'cat-refugio'], sedeId: 'sede-centro-civico', aliadoIds: [], eventoId: 'evt-inundacion-rimac', direccion: 'Jr. Lampa 1100', distrito: 'Cercado de Lima', lat: -12.0553, lng: -77.0365, horario: 'L-S 08:00-20:00', contactoNombre: 'Luis Ramos', contactoTelefono: '999-000-002', capacidad: 300, ocupacion: 240, actualizadoEn: '2026-10-29T16:30:00.000Z', observaciones: 'Prioridad en ropa de abrigo para adultos mayores.' },
  { id: 'pa-003', codigo: 'RPC-LO-03', nombre: 'Acopio Pro Norte', estado: 'saturado', categoriaIds: ['cat-alimentos', 'cat-agua'], sedeId: 'sede-pro', aliadoIds: ['aliado-red-solidaria'], eventoId: 'evt-lluvias-norte', direccion: 'Av. Alfredo Mendiola 1400', distrito: 'Los Olivos', lat: -11.9876, lng: -77.0702, horario: 'L-D 06:00-22:00', contactoNombre: 'Marta Flores', contactoTelefono: '999-000-003', capacidad: 400, ocupacion: 395, actualizadoEn: '2026-10-29T19:10:00.000Z', observaciones: 'Capacidad al límite, derivar nuevas donaciones.' },
  { id: 'pa-004', codigo: 'RPC-SM-04', nombre: 'Acopio San Miguel', estado: 'operativo', categoriaIds: ['cat-salud', 'cat-higiene'], sedeId: 'sede-san-miguel', aliadoIds: [], eventoId: 'evt-sismo-callao', direccion: 'Av. La Marina 2000', distrito: 'San Miguel', lat: -12.0774, lng: -77.0918, horario: 'L-D 07:00-20:00', contactoNombre: 'Pedro Díaz', contactoTelefono: '999-000-004', capacidad: 350, ocupacion: 90, actualizadoEn: '2026-10-29T15:00:00.000Z', observaciones: 'Punto con enfermería ficticia de apoyo.' },
  { id: 'pa-005', codigo: 'RPC-CM-05', nombre: 'Acopio Comas Lomas', estado: 'capacidad_limitada', categoriaIds: ['cat-refugio', 'cat-rescate'], sedeId: 'sede-plaza-norte', aliadoIds: ['aliado-red-solidaria'], eventoId: 'evt-deslizamiento-comas', direccion: 'Av. Túpac Amaru 4500', distrito: 'Comas', lat: -11.9389, lng: -77.0618, horario: 'L-D 06:00-21:00', contactoNombre: 'Rosa Huamán', contactoTelefono: '999-000-005', capacidad: 250, ocupacion: 160, actualizadoEn: '2026-10-29T17:45:00.000Z', observaciones: 'Coordinación con brigadas de rescate ficticias.' },
  { id: 'pa-006', codigo: 'RPC-SMP-06', nombre: 'Acopio San Martín Ribereño', estado: 'operativo', categoriaIds: ['cat-agua', 'cat-alimentos', 'cat-salud'], sedeId: 'sede-plaza-norte', aliadoIds: [], eventoId: 'evt-inundacion-rimac', direccion: 'Av. Perú 3200', distrito: 'San Martín de Porres', lat: -12.0211, lng: -77.0530, horario: 'L-D 07:00-21:00', contactoNombre: 'Jorge León', contactoTelefono: '999-000-006', capacidad: 450, ocupacion: 210, actualizadoEn: '2026-10-29T18:20:00.000Z', observaciones: 'Zona cercana a ribera, monitoreo constante.' },
  { id: 'pa-007', codigo: 'RPC-MI-07', nombre: 'Acopio Miraflores Apoyo', estado: 'operativo', categoriaIds: ['cat-ropa', 'cat-higiene', 'cat-alimentos'], sedeId: 'sede-primavera', aliadoIds: ['aliado-cruz-apoyo'], eventoId: null, direccion: 'Av. Larco 700', distrito: 'Miraflores', lat: -12.1211, lng: -77.0298, horario: 'L-S 09:00-19:00', contactoNombre: 'Carla Vega', contactoTelefono: '999-000-007', capacidad: 200, ocupacion: 55, actualizadoEn: '2026-10-29T14:10:00.000Z', observaciones: 'Punto de apoyo general sin evento asignado.' },
  { id: 'pa-008', codigo: 'RPC-SI-08', nombre: 'Acopio San Isidro Central', estado: 'operativo', categoriaIds: ['cat-salud', 'cat-agua'], sedeId: 'sede-primavera', aliadoIds: ['aliado-manos-unidas'], eventoId: 'evt-sismo-lima', direccion: 'Av. Javier Prado Este 500', distrito: 'San Isidro', lat: -12.0905, lng: -77.0270, horario: 'L-D 08:00-20:00', contactoNombre: 'Diego Soto', contactoTelefono: '999-000-008', capacidad: 300, ocupacion: 120, actualizadoEn: '2026-10-29T16:00:00.000Z', observaciones: 'Insumos de salud priorizados.' },
  { id: 'pa-009', codigo: 'RPC-ATE-09', nombre: 'Acopio Puruchuco Este', estado: 'cerrado', categoriaIds: ['cat-refugio'], sedeId: 'sede-puruchuco', aliadoIds: [], eventoId: 'evt-sismo-lima', direccion: 'Av. Nicolás Ayllón 2300', distrito: 'Ate', lat: -12.0288, lng: -76.9412, horario: 'Temporalmente cerrado', contactoNombre: 'Elena Torres', contactoTelefono: '999-000-009', capacidad: 280, ocupacion: 0, actualizadoEn: '2026-10-29T12:00:00.000Z', observaciones: 'Cerrado por mantenimiento ficticio.' },
  { id: 'pa-010', codigo: 'RPC-JM-10', nombre: 'Acopio Salaverry Anexo', estado: 'operativo', categoriaIds: ['cat-alimentos', 'cat-rescate'], sedeId: 'sede-salaverry', aliadoIds: ['aliado-cruz-apoyo'], eventoId: 'evt-inundacion-rimac', direccion: 'Av. Punta del Este 120', distrito: 'Jesús María', lat: -12.0862, lng: -77.0480, horario: 'L-D 07:00-22:00', contactoNombre: 'Hugo Palma', contactoTelefono: '999-000-010', capacidad: 320, ocupacion: 140, actualizadoEn: '2026-10-29T18:40:00.000Z', observaciones: 'Anexo logístico de la sede Salaverry.' },
  { id: 'pa-011', codigo: 'RPC-LO-11', nombre: 'Acopio Olivos Sur', estado: 'capacidad_limitada', categoriaIds: ['cat-agua', 'cat-higiene'], sedeId: 'sede-pro', aliadoIds: [], eventoId: 'evt-lluvias-norte', direccion: 'Av. Universitaria 1800', distrito: 'Los Olivos', lat: -11.9980, lng: -77.0820, horario: 'L-D 06:00-20:00', contactoNombre: 'Nina Cárdenas', contactoTelefono: '999-000-011', capacidad: 260, ocupacion: 200, actualizadoEn: '2026-10-29T17:00:00.000Z', observaciones: 'Alta demanda de agua potable.' },
  { id: 'pa-012', codigo: 'RPC-CM-12', nombre: 'Acopio Comas Central', estado: 'operativo', categoriaIds: ['cat-alimentos', 'cat-ropa'], sedeId: 'sede-plaza-norte', aliadoIds: ['aliado-red-solidaria'], eventoId: 'evt-deslizamiento-comas', direccion: 'Av. Metropolitana 300', distrito: 'Comas', lat: -11.9510, lng: -77.0430, horario: 'L-D 07:00-21:00', contactoNombre: 'Oscar Ríos', contactoTelefono: '999-000-012', capacidad: 380, ocupacion: 150, actualizadoEn: '2026-10-29T18:05:00.000Z', observaciones: 'Centro de distribución para laderas afectadas.' },
  { id: 'pa-013', codigo: 'RPC-CL-13', nombre: 'Acopio Cercado Mercado', estado: 'saturado', categoriaIds: ['cat-alimentos', 'cat-agua', 'cat-salud'], sedeId: 'sede-centro-civico', aliadoIds: ['aliado-manos-unidas'], eventoId: 'evt-inundacion-rimac', direccion: 'Jr. Ayacucho 800', distrito: 'Cercado de Lima', lat: -12.0498, lng: -77.0260, horario: 'L-D 06:00-22:00', contactoNombre: 'Sara Mendoza', contactoTelefono: '999-000-013', capacidad: 420, ocupacion: 410, actualizadoEn: '2026-10-29T19:25:00.000Z', observaciones: 'Muy alta afluencia, requiere apoyo logístico.' },
  { id: 'pa-014', codigo: 'RPC-SM-14', nombre: 'Acopio San Miguel Costanera', estado: 'operativo', categoriaIds: ['cat-refugio', 'cat-agua'], sedeId: 'sede-san-miguel', aliadoIds: ['aliado-cruz-apoyo'], eventoId: 'evt-sismo-callao', direccion: 'Av. Costanera 1500', distrito: 'San Miguel', lat: -12.0820, lng: -77.0990, horario: 'L-D 07:00-20:00', contactoNombre: 'Tomás Guerra', contactoTelefono: '999-000-014', capacidad: 300, ocupacion: 80, actualizadoEn: '2026-10-29T15:30:00.000Z', observaciones: 'Albergue temporal ficticio disponible.' },
  { id: 'pa-015', codigo: 'RPC-SI-15', nombre: 'Acopio San Isidro Empresarial', estado: 'capacidad_limitada', categoriaIds: ['cat-higiene', 'cat-alimentos', 'cat-ropa'], sedeId: 'sede-primavera', aliadoIds: [], eventoId: 'evt-sismo-lima', direccion: 'Calle Las Begonias 400', distrito: 'San Isidro', lat: -12.0960, lng: -77.0220, horario: 'L-V 08:00-18:00', contactoNombre: 'Valeria Núñez', contactoTelefono: '999-000-015', capacidad: 220, ocupacion: 175, actualizadoEn: '2026-10-29T16:50:00.000Z', observaciones: 'Acopio corporativo con horario reducido.' },
];

const recursos = [
  { id: 'rec-001', puntoAcopioId: 'pa-001', nombre: 'Arroz (sacos)', unidad: 'saco 25kg', cantidadDisponible: 120, cantidadComprometida: 30, estado: 'disponible' },
  { id: 'rec-002', puntoAcopioId: 'pa-001', nombre: 'Agua embotellada', unidad: 'pack 6u', cantidadDisponible: 40, cantidadComprometida: 10, estado: 'bajo' },
  { id: 'rec-003', puntoAcopioId: 'pa-001', nombre: 'Kits de higiene', unidad: 'kit', cantidadDisponible: 80, cantidadComprometida: 0, estado: 'disponible' },
  { id: 'rec-004', puntoAcopioId: 'pa-002', nombre: 'Frazadas', unidad: 'unidad', cantidadDisponible: 60, cantidadComprometida: 50, estado: 'bajo' },
  { id: 'rec-005', puntoAcopioId: 'pa-002', nombre: 'Carpas', unidad: 'unidad', cantidadDisponible: 15, cantidadComprometida: 12, estado: 'bajo' },
  { id: 'rec-006', puntoAcopioId: 'pa-003', nombre: 'Conservas', unidad: 'caja', cantidadDisponible: 0, cantidadComprometida: 0, estado: 'agotado' },
  { id: 'rec-007', puntoAcopioId: 'pa-003', nombre: 'Agua embotellada', unidad: 'pack 6u', cantidadDisponible: 10, cantidadComprometida: 8, estado: 'bajo' },
  { id: 'rec-008', puntoAcopioId: 'pa-004', nombre: 'Botiquines', unidad: 'unidad', cantidadDisponible: 45, cantidadComprometida: 5, estado: 'disponible' },
  { id: 'rec-009', puntoAcopioId: 'pa-004', nombre: 'Alcohol en gel', unidad: 'litro', cantidadDisponible: 90, cantidadComprometida: 0, estado: 'disponible' },
  { id: 'rec-010', puntoAcopioId: 'pa-005', nombre: 'Cuerdas de rescate', unidad: 'rollo', cantidadDisponible: 20, cantidadComprometida: 4, estado: 'disponible' },
  { id: 'rec-011', puntoAcopioId: 'pa-006', nombre: 'Agua embotellada', unidad: 'pack 6u', cantidadDisponible: 150, cantidadComprometida: 20, estado: 'disponible' },
  { id: 'rec-012', puntoAcopioId: 'pa-006', nombre: 'Fideos', unidad: 'caja', cantidadDisponible: 70, cantidadComprometida: 10, estado: 'disponible' },
  { id: 'rec-013', puntoAcopioId: 'pa-007', nombre: 'Ropa de abrigo', unidad: 'bolsa', cantidadDisponible: 35, cantidadComprometida: 0, estado: 'disponible' },
  { id: 'rec-014', puntoAcopioId: 'pa-008', nombre: 'Medicinas básicas', unidad: 'caja', cantidadDisponible: 25, cantidadComprometida: 5, estado: 'bajo' },
  { id: 'rec-015', puntoAcopioId: 'pa-010', nombre: 'Arroz (sacos)', unidad: 'saco 25kg', cantidadDisponible: 60, cantidadComprometida: 10, estado: 'disponible' },
  { id: 'rec-016', puntoAcopioId: 'pa-012', nombre: 'Ropa de abrigo', unidad: 'bolsa', cantidadDisponible: 40, cantidadComprometida: 8, estado: 'disponible' },
  { id: 'rec-017', puntoAcopioId: 'pa-013', nombre: 'Agua embotellada', unidad: 'pack 6u', cantidadDisponible: 5, cantidadComprometida: 5, estado: 'agotado' },
  { id: 'rec-018', puntoAcopioId: 'pa-014', nombre: 'Carpas', unidad: 'unidad', cantidadDisponible: 22, cantidadComprometida: 2, estado: 'disponible' },
  { id: 'rec-019', puntoAcopioId: 'pa-015', nombre: 'Kits de higiene', unidad: 'kit', cantidadDisponible: 50, cantidadComprometida: 20, estado: 'disponible' },
  { id: 'rec-020', puntoAcopioId: 'pa-011', nombre: 'Agua embotellada', unidad: 'pack 6u', cantidadDisponible: 18, cantidadComprometida: 15, estado: 'bajo' },
];

const puntosRiesgo = [
  { id: 'pr-001', tipo: 'inundacion', severidad: 'alto', descripcion: 'Calle inundada, paso vehicular bloqueado (reporte ficticio).', lat: -12.0470, lng: -77.0420, radioMetros: 350, distrito: 'Cercado de Lima', estado: 'activo', reportadoEn: new Date('2026-10-29T13:20:00.000Z') },
  { id: 'pr-002', tipo: 'derrumbe', severidad: 'critico', descripcion: 'Derrumbe en ladera, evacuar zona (reporte ficticio).', lat: -11.9420, lng: -77.0580, radioMetros: 500, distrito: 'Comas', estado: 'activo', reportadoEn: new Date('2026-10-29T11:05:00.000Z') },
  { id: 'pr-003', tipo: 'via_bloqueada', severidad: 'medio', descripcion: 'Vía bloqueada por acumulación de agua (reporte ficticio).', lat: -11.9950, lng: -77.0750, radioMetros: 200, distrito: 'Los Olivos', estado: 'en_verificacion', reportadoEn: new Date('2026-10-29T10:40:00.000Z') },
  { id: 'pr-004', tipo: 'incendio', severidad: 'alto', descripcion: 'Conato de incendio controlado parcialmente (reporte ficticio).', lat: -12.0800, lng: -77.0950, radioMetros: 250, distrito: 'San Miguel', estado: 'resuelto', reportadoEn: new Date('2026-10-28T22:15:00.000Z') },
  { id: 'pr-005', tipo: 'otro', severidad: 'bajo', descripcion: 'Señalización dañada en avenida principal (reporte ficticio).', lat: -12.1180, lng: -77.0290, radioMetros: 150, distrito: 'Miraflores', estado: 'activo', reportadoEn: new Date('2026-10-29T09:00:00.000Z') },
];

async function main() {
  console.log('🌱 Sembrando datos de demostración (ficticios)...');

  // Limpieza en orden de dependencias (idempotencia).
  await prisma.aliadoPunto.deleteMany();
  await prisma.categoriaPunto.deleteMany();
  await prisma.recurso.deleteMany();
  await prisma.puntoAcopio.deleteMany();
  await prisma.puntoRiesgo.deleteMany();
  await prisma.evento.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.empresa.deleteMany();

  await prisma.empresa.createMany({ data: empresas });
  await prisma.categoria.createMany({ data: categorias });
  await prisma.evento.createMany({ data: eventos });

  for (const p of puntosAcopio) {
    await prisma.puntoAcopio.create({
      data: {
        id: p.id, codigo: p.codigo, nombre: p.nombre, estado: p.estado,
        sedeId: p.sedeId, eventoId: p.eventoId, direccion: p.direccion, distrito: p.distrito,
        lat: p.lat, lng: p.lng, horario: p.horario, contactoNombre: p.contactoNombre,
        contactoTelefono: p.contactoTelefono, capacidad: p.capacidad, ocupacion: p.ocupacion,
        actualizadoEn: new Date(p.actualizadoEn), observaciones: p.observaciones,
        categorias: { create: p.categoriaIds.map((categoriaId) => ({ categoriaId })) },
        aliados: { create: p.aliadoIds.map((empresaId) => ({ empresaId })) },
      },
    });
    await prisma.$executeRaw`
      UPDATE puntos_acopio
      SET geom = ST_SetSRID(ST_MakePoint(${p.lng}, ${p.lat}), 4326)::geography
      WHERE id = ${p.id}
    `;
  }

  await prisma.recurso.createMany({ data: recursos });

  for (const r of puntosRiesgo) {
    await prisma.puntoRiesgo.create({ data: r });
    await prisma.$executeRaw`
      UPDATE puntos_riesgo
      SET geom = ST_SetSRID(ST_MakePoint(${r.lng}, ${r.lat}), 4326)::geography
      WHERE id = ${r.id}
    `;
  }

  console.log(
    `✅ Seed completo: ${empresas.length} empresas, ${categorias.length} categorías, ` +
      `${eventos.length} eventos, ${puntosAcopio.length} puntos de acopio, ` +
      `${recursos.length} recursos, ${puntosRiesgo.length} puntos de riesgo.`,
  );
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
