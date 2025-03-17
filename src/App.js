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
  CircularProgress, // Importamos el CircularProgress para mostrar el spinner
} from "@mui/material";
//import PanToolAltOutlinedIcon from "@mui/icons-material/PanToolAltOutlined";
//VIEW PDF
// Core viewer
import { Viewer, Worker } from "@react-pdf-viewer/core";
// Plugins
// import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
// Import styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

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
  const [message, setMessage] = useState({
    open: false,
    text: "",
    severity: "",
  });

  const [loading, setLoading] = useState(false); // Nuevo estado de carga

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación inicial
    if (!validate()) return;

    if (!formData.autorizacion) {
      setMessage({
        open: true,
        text: "Debes aceptar los términos y condiciones.",
        severity: "error",
      });
      return;
    }

    // Setear loading a true mientras enviamos la solicitud
    setLoading(true);

    // Crear el payload
    const payload = {
      nombre: formData.nombre,
      dni: formData.dni,
      celularPrincipal: formData.celular,
      celularOpcional: formData.celularOpcional || "",
      correoPrincipal: formData.correo,
      correoOpcional: formData.correoOpcional || "",
      empresa:
        formData.empresa === "Otros" ? formData.otraEmpresa : formData.empresa,
      autorizacion: formData.autorizacion,
      afiliacion: formData.afiliacion,
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/registrar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      // Verificar si la respuesta es válida
      if (response.ok) {
        const result = await response.json(); // Parsear la respuesta en formato JSON

        // Evaluar el código de respuesta
        if (result.code === 0) {
          const messageText = formData.afiliacion
            ? `¡Felicidades! Ya estas a un paso de ser parte de Servicredit.`
            : `¡Felicidades! Ya se grabaron tus datos, nos pondremos en contacto.`;
          setMessage({ open: true, text: messageText, severity: "success" });

          // Reiniciar el formulario
          setFormData({
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
        } else {
          // Manejar errores del API (code === 0)
          setMessage({
            open: true,
            text:
              result.message ||
              "Error al registrar. Por favor, intenta nuevamente.",
            severity: "error",
          });
        }
      } else {
        // Manejar errores de red o de servidor
        throw new Error("Error al registrar. Por favor, intenta nuevamente.");
      }
    } catch (error) {
      setMessage({
        open: true,
        text: error.message || "Error al conectar con el servidor.",
        severity: "error",
      });
    } finally {
      // Setear loading a false una vez que termina el proceso
      setLoading(false);
    }
  };

  //Dialog PDF
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pdfFile, setPdfFile] = useState(""); // Archivo PDF

  // Abre el Dialog con el PDF correspondiente
  const handleDialogOpen = (pdfType) => {
    if (pdfType === "privacidad") {
      setPdfFile("/pdf/privacidad.pdf");
    } else if (pdfType === "afiliacion") {
      setPdfFile("/pdf/afiliacion.pdf");
    }
    setIsDialogOpen(true);
  };

  // Cierra el Dialog
  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  // Título dinámico del Dialog
  const getDialogTitle = () => {
    if (pdfFile.includes("privacidad")) {
      return "Política de Privacidad";
    } else if (pdfFile.includes("afiliacion")) {
      return "Solicitud de Afiliación";
    }
    return "Política";
  };

  // Create new plugin instance
  // const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" align="center" marginY={2}>
        Registro a Servicredit
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
          label="Celular Personal"
          name="celular"
          value={formData.celular}
          onChange={handleChange}
          error={!!errors.celular}
          helperText={errors.celular}
          fullWidth
          margin="normal"
          inputProps={{ maxLength: 9 }}
        />
        {/* <TextField
          label="Celular Opcional"
          name="celularOpcional"
          value={formData.celularOpcional}
          onChange={handleChange}
          error={!!errors.celularOpcional}
          helperText={errors.celularOpcional}
          fullWidth
          margin="normal"
          inputProps={{ maxLength: 9 }}
        /> */}

        <TextField
          label="Correo Personal"
          name="correo"
          value={formData.correo}
          onChange={handleChange}
          error={!!errors.correo}
          helperText={errors.correo}
          fullWidth
          margin="normal"
        />

        {/* <TextField
          label="Correo Opcional"
          name="correoOpcional"
          value={formData.correoOpcional}
          onChange={handleChange}
          error={!!errors.correoOpcional}
          helperText={errors.correoOpcional}
          fullWidth
          margin="normal"
        /> */}

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
          label="Acepto el tratamiento de mis datos personales."
        />

        <Button
          variant="text"
          onClick={() => handleDialogOpen("privacidad")}
          sx={{
            textTransform: "none",
            display: "block",
            textAlign: "left",
            marginTop: -0.5,
          }}
        >
          Ver políticas de privacidad de uso de datos personales.
        </Button>

        <Box
          display="flex"
          alignItems="center"
          mb={1}
          sx={{
            backgroundColor: "#fe944b", // Fondo naranja
            color: "black", // Texto negro
            padding: "4px 8px", // Espaciado interno
            borderRadius: 1, // Bordes redondeados
            boxShadow: 1, // Sombra
            marginTop: 2.5, // Espaciado superior
            marginBottom: 0, // Espaciado inferior
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: "bold" }}>
            Triplica <span style={{ fontWeight: "bold" }}>AQUÍ</span>
          </Typography>
          <Box
            component="img"
            src="/images/finger.png"
            alt="Finger pointing"
            sx={{
              width: 25, // Ancho de la imagen
              height: 25, // Alto de la imagen
              marginLeft: 0.5, // Espaciado entre la imagen y el texto
            }}
          />
          <Typography variant="caption" sx={{ fontWeight: "bold" }}>
            a Servicredit
          </Typography>
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              name="afiliacion"
              checked={formData.afiliacion}
              onChange={handleChange}
            />
          }
          label="Quiero afiliarme"
        />

        <Button
          variant="text"
          onClick={() => handleDialogOpen("afiliacion")}
          sx={{
            textTransform: "none",
            display: "block",
            textAlign: "left",
            marginTop: -0.5,
          }}
        >
          Ver solicitud de afiliación.
        </Button>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ marginY: 3 }}
          disabled={loading} // Deshabilitar el botón mientras se está registrando
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" /> // Mostrar el spinner
          ) : (
            "Se parte de Servicredit"
          )}
        </Button>
      </Box>

      {/* Dialog PDF */}
      <Dialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{getDialogTitle()}</DialogTitle>
        <DialogContent>
          {pdfFile && (
            <>
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                {/* Tu código para mostrar el PDF */}
                <Viewer
                  fileUrl={pdfFile}
                  plugins={
                    [
                      // Register plugins
                      //defaultLayoutPluginInstance,
                    ]
                  }
                />
              </Worker>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar */}
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        open={message.open}
        autoHideDuration={6000}
        onClose={() => setMessage({ ...message, open: false })}
        sx={{
          "& .MuiPaper-root": {
            minWidth: "300px", // Ancho mínimo del Snackbar
            padding: "20px", // Relleno para hacerlo más espacioso
          },
        }}
      >
        <Alert
          severity={message.severity}
          sx={{ fontSize: "1.08rem", padding: "1rem", margin: "0 2rem 3rem" }} // Tamaño del texto y relleno del Alert
        >
          {message.text}
        </Alert>
      </Snackbar>
    </Container>
  );
}
