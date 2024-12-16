import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from "@mui/material";

const empresas = [
  "Camposol",
  "DC Capital",
  "Ecopacking",
  "DC Land Bank",
  "DC Grupo Inmobiliario",
  "Marinasol",
  "OCP",
  "Refinca",
  "Otros",
];

export default function App() {
  const [formData, setFormData] = useState({
    nombre: "",
    dni: "",
    celular: "",
    celularOpcional: "",
    correo: "",
    correoOpcional: "",
    empresa: "",
    otraEmpresa: "",
    autorizacion: false,
    afiliacion: false,
  });

  const [errors, setErrors] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [message, setMessage] = useState({
    open: false,
    text: "",
    severity: "",
  });

  const validate = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!/^\d{8}$/.test(formData.dni))
      newErrors.dni = "El DNI debe tener 8 dígitos numéricos";
    if (!/^9\d{8}$/.test(formData.celular))
      newErrors.celular = "El celular debe tener 9 dígitos y comenzar con 9";
    if (formData.celularOpcional && !/^9\d{8}$/.test(formData.celularOpcional))
      newErrors.celularOpcional = "El celular opcional debe comenzar con 9";
    if (!/\S+@\S+\.\S+/.test(formData.correo))
      newErrors.correo = "Debe ingresar un correo válido";
    if (
      formData.correoOpcional &&
      !/\S+@\S+\.\S+/.test(formData.correoOpcional)
    )
      newErrors.correoOpcional = "El correo opcional no es válido";
    if (!formData.empresa) newErrors.empresa = "Debe seleccionar una empresa";
    if (formData.empresa === "Otros" && !formData.otraEmpresa.trim())
      newErrors.otraEmpresa = "Debe ingresar el nombre de la empresa";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (formData.autorizacion) {
      const messageText = formData.afiliacion
        ? "¡Felicidades! Has triplicado tus opciones al sorteo."
        : "¡Felicidades! Ya estás participando en el sorteo.";
      setMessage({ open: true, text: messageText, severity: "success" });
    } else {
      setMessage({
        open: true,
        text: "Debes aceptar los términos y condiciones.",
        severity: "error",
      });
    }
  };

  const handleDialogClose = () => setIsDialogOpen(false);

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" align="center" marginY={2}>
        Registro al Sorteo
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Nombre y Apellidos"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          error={!!errors.nombre}
          helperText={errors.nombre}
          fullWidth
          margin="normal"
        />

        <TextField
          label="DNI"
          name="dni"
          value={formData.dni}
          onChange={handleChange}
          error={!!errors.dni}
          helperText={errors.dni}
          fullWidth
          margin="normal"
          inputProps={{ maxLength: 8 }}
        />

        <TextField
          label="Celular Principal"
          name="celular"
          value={formData.celular}
          onChange={handleChange}
          error={!!errors.celular}
          helperText={errors.celular}
          fullWidth
          margin="normal"
          inputProps={{ maxLength: 9 }}
        />

        <TextField
          label="Celular Opcional"
          name="celularOpcional"
          value={formData.celularOpcional}
          onChange={handleChange}
          error={!!errors.celularOpcional}
          helperText={errors.celularOpcional}
          fullWidth
          margin="normal"
          inputProps={{ maxLength: 9 }}
        />

        <TextField
          label="Correo Principal"
          name="correo"
          value={formData.correo}
          onChange={handleChange}
          error={!!errors.correo}
          helperText={errors.correo}
          fullWidth
          margin="normal"
        />

        <TextField
          label="Correo Opcional"
          name="correoOpcional"
          value={formData.correoOpcional}
          onChange={handleChange}
          error={!!errors.correoOpcional}
          helperText={errors.correoOpcional}
          fullWidth
          margin="normal"
        />

        <TextField
          label="¿A qué empresa perteneces?"
          name="empresa"
          value={formData.empresa}
          onChange={handleChange}
          error={!!errors.empresa}
          helperText={errors.empresa}
          fullWidth
          margin="normal"
          select
        >
          {empresas.map((empresa) => (
            <MenuItem key={empresa} value={empresa}>
              {empresa}
            </MenuItem>
          ))}
        </TextField>

        {/* Campo adicional para empresa "Otros" */}
        {formData.empresa === "Otros" && (
          <TextField
            label="Nombre de la Empresa"
            name="otraEmpresa"
            value={formData.otraEmpresa}
            onChange={handleChange}
            error={!!errors.otraEmpresa}
            helperText={errors.otraEmpresa}
            fullWidth
            margin="normal"
          />
        )}

        <FormControlLabel
          control={
            <Checkbox
              name="autorizacion"
              checked={formData.autorizacion}
              onChange={handleChange}
            />
          }
          label="Acepto los términos y condiciones de uso de datos personales"
        />

        <Button
          variant="text"
          onClick={() => setIsDialogOpen(true)}
          sx={{ textTransform: "none" }}
        >
          Ver Políticas
        </Button>

        <FormControlLabel
          control={
            <Checkbox
              name="afiliacion"
              checked={formData.afiliacion}
              onChange={handleChange}
            />
          }
          label="Quiero afiliarme a Servicredit"
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ marginY: 2 }}
        >
          Participa en el Sorteo
        </Button>
      </Box>

      {/* Modal */}
      <Dialog open={isDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Políticas de Tratamiento de Datos</DialogTitle>
        <DialogContent>
          <Typography>
            Al participar, autorizas el uso de tus datos personales conforme a
            la Ley de Protección de Datos...
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={message.open}
        autoHideDuration={4000}
        onClose={() => setMessage({ ...message, open: false })}
      >
        <Alert severity={message.severity}>{message.text}</Alert>
      </Snackbar>
    </Container>
  );
}
