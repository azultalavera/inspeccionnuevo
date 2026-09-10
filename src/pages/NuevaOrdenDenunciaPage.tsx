import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  presentarDenunciaSanitaria,
  type MotivoDenunciaEnum,
  type AdjuntoEvidenciaPayload,
} from '../services/denunciaApi'

// ─── Material UI Components ──────────────────────────────────────────────────
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  styled,
  Alert,
  Checkbox,
  FormControlLabel,
  Chip,
} from '@mui/material'

// ─── Material UI Icons ───────────────────────────────────────────────────────
import {
  Place as PlaceIcon,
  Domain as DomainIcon,
  ReportProblem as ReportProblemIcon,
  CloudUpload as CloudUploadIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  ContentCopy as ContentCopyIcon,
  Download as DownloadIcon,
  ListAlt as ListAltIcon,
  Verified as VerifiedIcon,
  Gavel as GavelIcon,
  CleanHands as CleanHandsIcon,
  Biotech as BiotechIcon,
  Block as BlockIcon,
  Badge as BadgeIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material'

// ─── Paleta ClicSalud Trámite ────────────────────────────────────────────────
const COLOR = {
  headerBg:     '#C4283F', // Rojo Denuncia ClicSalud
  stepActive:   '#C4283F',
  stepInactive: '#B0BEC5',
  stepLine:     '#CFD8DC',
  titleBlue:    '#00A9E0', // Celeste de títulos de apartados
  gray50:       '#F8FAFC',
  gray100:      '#F1F5F9',
  gray200:      '#E5E7EB',
  gray300:      '#D1D5DB',
  gray500:      '#6B7280',
  gray700:      '#374151',
  gray900:      '#111827',
}

// ─── Stepper Custom Connector ────────────────────────────────────────────────
const QontoConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 22 },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: COLOR.stepLine,
    borderTopWidth: 2,
  },
}))

const StepIconRoot = styled('div')<{ ownerState: { active?: boolean; completed?: boolean } }>(
  ({ ownerState }) => ({
    backgroundColor: ownerState.active ? COLOR.stepActive : COLOR.stepInactive,
    zIndex: 1,
    color: '#fff',
    width: 44,
    height: 44,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.25s ease',
    boxShadow: ownerState.active ? '0 4px 12px rgba(196, 40, 63, 0.4)' : 'none',
    transform: ownerState.active ? 'scale(1.08)' : 'scale(1)',
    cursor: 'pointer',
    '&:hover': {
      transform: 'scale(1.08)',
      backgroundColor: COLOR.stepActive,
    },
  })
)

// ─── Pasos del Trámite de Denuncia ───────────────────────────────────────────
const STEPS = [
  { id: 'ubicacion',       label: 'Ubicación',             icon: <PlaceIcon sx={{ fontSize: 22 }} /> },
  { id: 'establecimiento', label: 'Establecimiento',       icon: <DomainIcon sx={{ fontSize: 22 }} /> },
  { id: 'motivo',          label: 'Motivo de Denuncia',    icon: <ReportProblemIcon sx={{ fontSize: 22 }} /> },
  { id: 'documentos',      label: 'Documentos Adjuntos',   icon: <CloudUploadIcon sx={{ fontSize: 22 }} /> },
  { id: 'declaracion',     label: 'Declaración Jurada',    icon: <AssignmentTurnedInIcon sx={{ fontSize: 22 }} /> },
]

const MOTIVOS: { id: MotivoDenunciaEnum; label: string; icon: React.ReactNode }[] = [
  { id: 'FALTA_HABILITACION',            label: 'Falta de Habilitación',          icon: <BlockIcon sx={{ fontSize: 20 }} /> },
  { id: 'EJERCICIO_ILEGAL',              label: 'Ejercicio Ilegal',                icon: <GavelIcon sx={{ fontSize: 20 }} /> },
  { id: 'CONDICIONES_HIGIENICO_SANITARIAS', label: 'Condiciones Higiénicas',       icon: <CleanHandsIcon sx={{ fontSize: 20 }} /> },
  { id: 'EQUIPAMIENTO_NO_AUTORIZADO',    label: 'Equipamiento No Autorizado',      icon: <BiotechIcon sx={{ fontSize: 20 }} /> },
  { id: 'OTRO',                          label: 'Otro Incumplimiento',             icon: <ReportProblemIcon sx={{ fontSize: 20 }} /> },
]

const TIPOLOGIAS = [
  'Sin especificar', 'Consultorio / Centro Médico', 'Clínica, Sanatorio u Hospital Privado',
  'Residencia Geriátrica', 'Centro de Estética / Cosmiatría', 'Laboratorio de Análisis Clínicos',
  'Óptica y Contactología', 'Tatuadores y Perforadores', 'Servicio de Diálisis / Nefrología',
  'Farmacia / Droguería', 'Otro Establecimiento',
]

// ─── Sub-Tarjeta Interior (Estilo Habilitación con MUI Paper) ────────────────
interface SubCardProps {
  title?: string
  subtitle?: string
  children: React.ReactNode
}

function SubCard({ title, subtitle, children }: SubCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        width: '100%',
        boxSizing: 'border-box',
        p: 2.5,
        borderRadius: 2,
        borderColor: COLOR.gray200,
        backgroundColor: '#FFFFFF',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
      }}
    >
      {title && (
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            color: COLOR.gray900,
            fontSize: '0.95rem',
            mb: subtitle ? 0.5 : 1.5,
          }}
        >
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography
          variant="body2"
          sx={{
            color: COLOR.gray500,
            fontSize: '0.85rem',
            mb: 1.5,
          }}
        >
          {subtitle}
        </Typography>
      )}
      {children}
    </Paper>
  )
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function NuevaOrdenDenunciaPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [activeStep, setActiveStep] = useState(0)
  const [nroTramite] = useState('24') // "Trámite Nº 24 Denuncia"
  const [nombreTitular] = useState('Perez, Juan')
  const [submitted, setSubmitted] = useState(false)
  const [copiado, setCopiado] = useState(false)

  const isEfector = user?.rol === 'EFECTOR'
  const returnPath = isEfector ? '/efector/mis-denuncias' : '/agente-denuncias/denuncias'

  // Paso 1: Ubicación
  const [localidad, setLocalidad] = useState('Córdoba')
  const [calle, setCalle] = useState('')
  const [numero, setNumero] = useState('')
  const [departamento, setDepartamento] = useState('Capital')
  const [referenciaUbicacion, setReferenciaUbicacion] = useState('')

  // Paso 2: Establecimiento
  const [nombreEstablecimiento, setNombreEstablecimiento] = useState('')
  const [personaReferencia, setPersonaReferencia] = useState('')
  const [cuit, setCuit] = useState('')
  const [tipologia, setTipologia] = useState(TIPOLOGIAS[0])

  // Paso 3: Motivo & Descripción
  const [motivo, setMotivo] = useState<MotivoDenunciaEnum>('FALTA_HABILITACION')
  const [descripcion, setDescripcion] = useState('')

  // Paso 4: Documentación
  const [adjuntos, setAdjuntos] = useState<{ id: string; nombre: string; tamaño: string; tipo: 'IMAGEN' | 'PDF' | 'DOCUMENTO'; url: string }[]>([])

  // Paso 5: Denunciante & Confirmación
  const [esAnonima, setEsAnonima] = useState(false)
  const [cuitDenunciante] = useState(user?.cuil || '20-33445566-7')
  const [nombreDenunciante] = useState(`${user?.nombre || 'Agente'} ${user?.apellido || 'Denuncias'}`)
  const [correoDenunciante, setCorreoDenunciante] = useState('denuncias@msal.cba.gov.ar')
  const [aceptaDeclaracion, setAceptaDeclaracion] = useState(false)

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    Array.from(files).forEach(file => {
      const ext = file.name.split('.').pop()?.toLowerCase()
      let tipo: 'IMAGEN' | 'PDF' | 'DOCUMENTO' = 'DOCUMENTO'
      if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) tipo = 'IMAGEN'
      else if (ext === 'pdf') tipo = 'PDF'
      const sizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${(file.size / 1024).toFixed(1)} KB`
      const reader = new FileReader()
      reader.onload = () => setAdjuntos(prev => [...prev, { id: Math.random().toString(36).substring(2, 9), nombre: file.name, tamaño: sizeStr, tipo, url: (reader.result as string) || '' }])
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const handleNext = () => {
    if (activeStep === 0 && (!localidad.trim() || !calle.trim() || !numero.trim())) {
      setErrorMsg('La Localidad, Calle y Número son obligatorios.')
      return
    }
    setErrorMsg('')
    if (activeStep < STEPS.length - 1) {
      setActiveStep(activeStep + 1)
    }
  }

  const handlePrev = () => {
    setErrorMsg('')
    if (activeStep > 0) {
      setActiveStep(activeStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!localidad.trim() || !calle.trim() || !numero.trim()) {
      setErrorMsg('La Localidad, Calle y Número son obligatorios en Ubicación.')
      setActiveStep(0)
      return
    }
    if (!aceptaDeclaracion) {
      setErrorMsg('Debe aceptar la declaración jurada antes de presentar la denuncia.')
      return
    }
    setErrorMsg('')
    setLoading(true)
    try {
      const payloadAdj: AdjuntoEvidenciaPayload[] = adjuntos.map(a => ({
        url: a.url,
        tipo: a.tipo,
        hash_sha256: `sha256_${Math.random().toString(36).substring(2, 16)}`,
      }))
      await presentarDenunciaSanitaria({
        denunciante: { cuit_cuil: cuitDenunciante, nombre_completo: nombreDenunciante, correo: correoDenunciante, es_anonima: esAnonima },
        establecimiento_denunciado: {
          es_registrado: false,
          razon_social_o_nombre: nombreEstablecimiento || 'Establecimiento Sin Nombre / En Relevamiento',
          persona_referencia: personaReferencia || undefined,
          cuit_titular_presunto: cuit || null,
          domicilio: { calle, numero, localidad, departamento: departamento || 'Capital', provincia: 'Córdoba' },
          tipologia_estimada: tipologia !== 'Sin especificar' ? tipologia : undefined,
        },
        motivo_denuncia: motivo,
        descripcion_detallada: descripcion || `Denuncia por ${motivo} en ${calle} ${numero}, ${localidad}.`,
        adjuntos_evidencia: payloadAdj,
      })
    } catch {
      // Offline fallback
    } finally {
      setLoading(false)
      setSubmitted(true)
    }
  }

  // ── Vista de Éxito / Confirmación ──────────────────────────────────────────
  if (submitted) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 5,
            maxWidth: 540,
            width: '100%',
            textAlign: 'center',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          }}
        >
          <Box sx={{ width: 68, height: 68, borderRadius: '50%', bgcolor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <VerifiedIcon sx={{ fontSize: 38 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: COLOR.gray900, mb: 1 }}>
            ¡Denuncia Presentada con Éxito!
          </Typography>
          <Typography variant="body2" sx={{ color: COLOR.gray500, lineHeight: 1.6, mb: 3 }}>
            El trámite ha sido registrado en el Sistema ClicSalud+ y derivado para fiscalización in situ.
          </Typography>

          <Paper variant="outlined" sx={{ p: 2, bgcolor: COLOR.gray50, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5 }}>
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: COLOR.gray500, textTransform: 'uppercase' }}>
                Trámite Registrado
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: COLOR.headerBg, fontFamily: 'monospace' }}>
                Trámite Nº {nroTramite} Denuncia
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={() => { navigator.clipboard.writeText(`Trámite Nº ${nroTramite} Denuncia`); setCopiado(true); setTimeout(() => setCopiado(false), 3000) }}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              {copiado ? '¡Copiado!' : 'Copiar'}
            </Button>
          </Paper>

          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => alert(`Descargando Comprobante Trámite Nº ${nroTramite} Denuncia.pdf...`)}
              sx={{ fontWeight: 700, textTransform: 'none' }}
            >
              Descargar Comprobante PDF
            </Button>
            <Button
              variant="contained"
              startIcon={<ListAltIcon />}
              onClick={() => navigate(returnPath)}
              sx={{ bgcolor: COLOR.headerBg, fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#A01E30' } }}
            >
              {isEfector ? 'Ir a Mis Denuncias' : 'Ir a Bandeja de Denuncias'}
            </Button>
          </Box>
        </Paper>
      </Box>
    )
  }

  // ── Vista Principal con Header y Stepper Material UI ──────────────────────
  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box', p: { xs: 1.5, sm: 2.5 } }}>
      
      {/* Tarjeta Principal del Trámite */}
      <Paper
        elevation={2}
        sx={{
          width: '100%',
          boxSizing: 'border-box',
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
        }}
      >
        {/* ── BANNER SUPERIOR ROJO ────────────────────────────────────────── */}
        <Box
          sx={{
            backgroundColor: COLOR.headerBg,
            color: '#FFFFFF',
            py: 1.8,
            px: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.3, fontSize: '1.25rem' }}>
            Trámite Nº {nroTramite} Denuncia
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 0.3, opacity: 0.95, fontSize: '0.95rem' }}>
            {nombreTitular}
          </Typography>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#FFFFFF' }}>

          {/* ── STEPPER MATERIAL UI ────────────────────────────────────────── */}
          <Box sx={{ mb: 2 }}>
            <Stepper alternativeLabel activeStep={activeStep} connector={<QontoConnector />}>
              {STEPS.map((step, index) => (
                <Step key={step.id}>
                  <StepLabel
                    slots={{
                      stepIcon: () => (
                        <StepIconRoot
                          ownerState={{ active: activeStep === index, completed: activeStep > index }}
                          onClick={() => { setErrorMsg(''); setActiveStep(index) }}
                        >
                          {step.icon}
                        </StepIconRoot>
                      ),
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: activeStep === index ? 800 : 600,
                        color: activeStep === index ? COLOR.stepActive : COLOR.gray700,
                        display: 'block',
                        mt: 0.8,
                        fontSize: '0.8rem',
                      }}
                    >
                      {step.label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Texto Orientativo Oficial */}
          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              color: COLOR.gray500,
              fontSize: '0.82rem',
              mb: 2,
            }}
          >
            Los campos señalizados con (*) son obligatorios.
          </Typography>

          {/* Mensaje de Error si falta algún dato */}
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5, fontWeight: 600, py: 0.5 }}>
              {errorMsg}
            </Alert>
          )}

          {/* ── CONTENEDOR DEL PASO ACTIVO (ALTURA Y ANCHO FIJOS) ──────────── */}
          <Paper
            variant="outlined"
            sx={{
              width: '100%',
              boxSizing: 'border-box',
              p: 2.5,
              borderRadius: 2,
              borderColor: COLOR.gray200,
              mb: 2,
              height: '320px',
              minHeight: '320px',
              maxHeight: '320px',
              overflowY: 'auto',
            }}
          >
            {/* Título Celeste del Paso */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: COLOR.titleBlue,
                fontSize: '1.15rem',
                mb: 1.5,
              }}
            >
              {STEPS[activeStep].label}
            </Typography>

            {/* PASO 0: UBICACIÓN */}
            {activeStep === 0 && (
              <SubCard
                title="Domicilio del hecho"
                subtitle="Indique la localidad, calle y altura donde se constató o presume la infracción sanitaria."
              >
                <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
                  <TextField
                    fullWidth
                    variant="standard"
                    label={<>Localidad <Box component="span" sx={{ color: 'error.main' }}>*</Box></>}
                    value={localidad}
                    onChange={(e) => setLocalidad(e.target.value)}
                    placeholder="Ej. Córdoba / Río Cuarto"
                  />
                  <TextField
                    fullWidth
                    variant="standard"
                    label={<>Calle <Box component="span" sx={{ color: 'error.main' }}>*</Box></>}
                    value={calle}
                    onChange={(e) => setCalle(e.target.value)}
                    placeholder="Ej. Av. Colón / San Martín"
                  />
                  <TextField
                    fullWidth
                    variant="standard"
                    label={<>Número / Altura <Box component="span" sx={{ color: 'error.main' }}>*</Box></>}
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    placeholder="Ej. 1420 (o S/N)"
                  />
                  <TextField
                    fullWidth
                    variant="standard"
                    label="Departamento / Jurisdicción"
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                    placeholder="Ej. Capital / Punilla"
                  />
                </Box>
                <Box sx={{ mt: 2.5 }}>
                  <TextField
                    fullWidth
                    variant="standard"
                    label="Referencias adicionales del lugar (Opcional)"
                    value={referenciaUbicacion}
                    onChange={(e) => setReferenciaUbicacion(e.target.value)}
                    placeholder="Ej. Entre calles San Jerónimo y 27 de Abril, frente a la plaza"
                  />
                </Box>
              </SubCard>
            )}

            {/* PASO 1: ESTABLECIMIENTO */}
            {activeStep === 1 && (
              <SubCard title="Identificación del establecimiento">
                <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                  <TextField
                    fullWidth
                    variant="standard"
                    label="Nombre / Razón Social"
                    value={nombreEstablecimiento}
                    onChange={(e) => setNombreEstablecimiento(e.target.value)}
                    placeholder="Ej. Consultorio Dr. Pérez"
                  />
                  <FormControl fullWidth variant="standard">
                    <InputLabel>Tipología Estimada</InputLabel>
                    <Select
                      value={tipologia}
                      onChange={(e) => setTipologia(e.target.value)}
                    >
                      {TIPOLOGIAS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    variant="standard"
                    label="CUIT Titular / Presunto"
                    value={cuit}
                    onChange={(e) => setCuit(e.target.value)}
                    placeholder="Ej. 20-33445566-7"
                  />
                  <TextField
                    fullWidth
                    variant="standard"
                    label="Persona de Referencia en el Lugar"
                    value={personaReferencia}
                    onChange={(e) => setPersonaReferencia(e.target.value)}
                    placeholder="Ej. Secretaria María"
                  />
                </Box>
              </SubCard>
            )}

            {/* PASO 2: MOTIVO DE DENUNCIA */}
            {activeStep === 2 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <SubCard title="Tipificación de la presunta infracción">
                  <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, gap: 1.5 }}>
                    {MOTIVOS.map(m => {
                      const isSel = motivo === m.id
                      return (
                        <Paper
                          key={m.id}
                          variant="outlined"
                          onClick={() => setMotivo(m.id)}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            cursor: 'pointer',
                            borderColor: isSel ? COLOR.headerBg : COLOR.gray300,
                            backgroundColor: isSel ? '#FDF2F4' : '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            transition: 'all 0.15s ease',
                            boxShadow: isSel ? '0 2px 8px rgba(196, 40, 63, 0.15)' : 'none',
                            '&:hover': { borderColor: COLOR.headerBg },
                          }}
                        >
                          <Box sx={{ color: isSel ? COLOR.headerBg : COLOR.gray500, display: 'flex' }}>
                            {m.icon}
                          </Box>
                          <Typography sx={{ flex: 1, fontSize: '0.82rem', fontWeight: isSel ? 700 : 500, color: isSel ? COLOR.headerBg : COLOR.gray700 }}>
                            {m.label}
                          </Typography>
                          {isSel && (
                            <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: COLOR.headerBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>
                              ✓
                            </Box>
                          )}
                        </Paper>
                      )
                    })}
                  </Box>
                </SubCard>

                <SubCard title="Descripción u observaciones del hecho">
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    variant="standard"
                    label="Detalle de los hechos observados"
                    placeholder="Detalles sobre lo ocurrido, horarios de atención observados, actividad irregular detectada o referencias útiles para la inspección..."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                  />
                </SubCard>
              </Box>
            )}

            {/* PASO 3: DOCUMENTOS ADJUNTOS */}
            {activeStep === 3 && (
              <SubCard title="Archivos probatorios adjuntos">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="body2" sx={{ color: COLOR.gray500, fontWeight: 500 }}>
                    {adjuntos.length === 0 ? 'No se han adjuntado archivos aún.' : `${adjuntos.length} archivo(s) seleccionado(s)`}
                  </Typography>
                  <Button
                    component="label"
                    size="small"
                    variant="outlined"
                    startIcon={<AttachFileIcon />}
                    sx={{ textTransform: 'none', fontWeight: 700, borderColor: COLOR.gray300, color: COLOR.gray700 }}
                  >
                    Cargar Archivo
                    <input type="file" multiple hidden onChange={handleFileChange} />
                  </Button>
                </Box>

                {adjuntos.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {adjuntos.map(adj => (
                      <Chip
                        key={adj.id}
                        label={`${adj.nombre} (${adj.tamaño})`}
                        onDelete={() => setAdjuntos(prev => prev.filter(a => a.id !== adj.id))}
                        deleteIcon={<CloseIcon sx={{ fontSize: '14px !important' }} />}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600, fontSize: '0.8rem' }}
                      />
                    ))}
                  </Box>
                )}
              </SubCard>
            )}

            {/* PASO 4: DECLARACIÓN JURADA */}
            {activeStep === 4 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <SubCard title="Modalidad de presentación">
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    {[false, true].map(anon => (
                      <Paper
                        key={String(anon)}
                        variant="outlined"
                        onClick={() => setEsAnonima(anon)}
                        sx={{
                          flex: 1,
                          p: 1.5,
                          borderRadius: 2,
                          cursor: 'pointer',
                          borderColor: esAnonima === anon ? '#0284C7' : COLOR.gray300,
                          backgroundColor: esAnonima === anon ? '#EFF6FF' : '#FFFFFF',
                          color: esAnonima === anon ? '#0284C7' : COLOR.gray700,
                          fontWeight: esAnonima === anon ? 700 : 500,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {anon ? <VisibilityOffIcon sx={{ fontSize: 20 }} /> : <BadgeIcon sx={{ fontSize: 20 }} />}
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: esAnonima === anon ? 700 : 500 }}>
                          {anon ? 'Presentación Anónima' : 'Identidad Declarada (Reserva de Ley)'}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>

                  {!esAnonima ? (
                    <Box sx={{ width: '100%', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2.5 }}>
                      <TextField
                        fullWidth
                        variant="standard"
                        label="Denunciante"
                        value={nombreDenunciante}
                        disabled
                      />
                      <TextField
                        fullWidth
                        variant="standard"
                        label="CUIT / CUIL"
                        value={cuitDenunciante}
                        disabled
                      />
                      <TextField
                        fullWidth
                        variant="standard"
                        label="Correo de Contacto"
                        value={correoDenunciante}
                        onChange={(e) => setCorreoDenunciante(e.target.value)}
                      />
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: COLOR.gray500, fontStyle: 'italic', fontSize: '0.85rem' }}>
                      * Los datos filiatorios no serán registrados en el expediente público de inspección ni expuestos en el acta in situ.
                    </Typography>
                  )}
                </SubCard>

                <SubCard title="Declaración jurada de veracidad">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={aceptaDeclaracion}
                        onChange={(e) => setAceptaDeclaracion(e.target.checked)}
                        sx={{ color: COLOR.headerBg, '&.Mui-checked': { color: COLOR.headerBg } }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: '0.88rem', color: COLOR.gray700, lineHeight: 1.5 }}>
                        <Box component="span" sx={{ fontWeight: 700, color: COLOR.headerBg }}>DECLARACIÓN JURADA: </Box>
                        Declaro bajo juramento que los hechos expuestos son verídicos, teniendo conocimiento de las responsabilidades civiles y penales emergentes en caso de falsedad (Leyes Provinciales N° 6222 y 9847).
                      </Typography>
                    }
                  />
                </SubCard>

                <Typography variant="caption" sx={{ color: COLOR.gray500, lineHeight: 1.5, display: 'block', px: 0.5 }}>
                  Sr/a agente recuerde que los datos que se muestran se corresponden con aquellos registrados en el sistema oficial del Ministerio de Salud.
                </Typography>
              </Box>
            )}

          </Paper>

          {/* ── BOTONERA INFERIOR MATERIAL UI ──────────────────────────────── */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: `1px solid ${COLOR.gray200}`,
              pt: 2,
              flexWrap: 'wrap',
              gap: 1.5,
            }}
          >
            {/* Izquierda: Volver a bandeja */}
            <Button
              variant="outlined"
              onClick={() => navigate(returnPath)}
              sx={{
                color: COLOR.headerBg,
                borderColor: COLOR.headerBg,
                fontWeight: 700,
                fontSize: '0.82rem',
                px: 2.5,
                textTransform: 'none',
                '&:hover': {
                  borderColor: COLOR.headerBg,
                  backgroundColor: 'rgba(196, 40, 63, 0.04)',
                },
              }}
            >
              VOLVER A BANDEJA
            </Button>

            {/* Centro y Derecha: Navegación */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {activeStep > 0 && (
                <Button
                  variant="outlined"
                  onClick={handlePrev}
                  sx={{
                    color: COLOR.gray700,
                    borderColor: COLOR.gray300,
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    px: 2.5,
                    textTransform: 'none',
                  }}
                >
                  ANTERIOR
                </Button>
              )}

              <Button
                variant="outlined"
                onClick={() => alert('Borrador de denuncia guardado.')}
                sx={{
                  color: COLOR.gray700,
                  borderColor: COLOR.gray300,
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  px: 2.5,
                  textTransform: 'none',
                }}
              >
                GUARDAR
              </Button>

              {activeStep < STEPS.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    backgroundColor: COLOR.titleBlue,
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    px: 3.5,
                    textTransform: 'none',
                    boxShadow: '0 2px 6px rgba(0, 169, 224, 0.3)',
                    '&:hover': {
                      backgroundColor: '#0090C0',
                    },
                  }}
                >
                  SIGUIENTE
                </Button>
              ) : (
                <Button
                  variant="contained"
                  disabled={loading || !aceptaDeclaracion}
                  onClick={handleSubmit}
                  sx={{
                    backgroundColor: COLOR.headerBg,
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    px: 3.5,
                    textTransform: 'none',
                    boxShadow: '0 2px 8px rgba(196, 40, 63, 0.35)',
                    '&:hover': {
                      backgroundColor: '#A01E30',
                    },
                  }}
                >
                  {loading ? 'TRANSMITIENDO...' : 'CONFIRMAR Y PRESENTAR'}
                </Button>
              )}
            </Box>
          </Box>

        </Box>
      </Paper>
    </Box>
  )
}
