import React from "react";
import {
  FormControl,
  MenuItem,
  Pagination,
  PaginationItem,
  Select,
  SelectChangeEvent,
  Typography,
  Box,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { ChangeEvent, Dispatch, SetStateAction } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// Tema compatible con paleta azul institucional de ClicSalud
const customPaginationTheme = createTheme({
  palette: {
    primary: {
      main: "#0055A5",
      contrastText: "#ffffff",
    },
    // @ts-expect-error custom palette property for azul
    azul: {
      main: "#0055A5",
      contrastText: "#ffffff",
    },
  },
});

interface MiPaginationProps {
  cantidadFilasPorPagina: number;
  cantidadPaginas: number;
  paginaSeleccionada: number;
  setCantidadFilasPorPagina: Dispatch<SetStateAction<number>>;
  setPaginaSeleccionada: Dispatch<SetStateAction<number>>;
}

export default function MiPagination({
  cantidadFilasPorPagina,
  cantidadPaginas,
  paginaSeleccionada,
  setCantidadFilasPorPagina,
  setPaginaSeleccionada,
}: MiPaginationProps) {
  const handleChangePags = (ev: SelectChangeEvent) => {
    setPaginaSeleccionada(1);
    setCantidadFilasPorPagina(parseInt(ev.target.value));
  };

  const handleChangeNumeroPagina = (_event: ChangeEvent<unknown>, value: number) => {
    setPaginaSeleccionada(Number(value));
  };

  return (
    <ThemeProvider theme={customPaginationTheme}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            sx={{
              fontSize: "0.85rem",
              color: "text.secondary",
              fontWeight: 500,
              mr: 1,
            }}
          >
            Items por página:
          </Typography>
          <FormControl variant="standard">
            <Select
              value={String(cantidadFilasPorPagina)}
              onChange={handleChangePags}
              disableUnderline
              MenuProps={{
                slotProps: {
                  paper: {
                    sx: {
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      mt: 0.5,
                      "& .MuiMenuItem-root": {
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        justifyContent: "center",
                        borderRadius: "6px",
                        margin: "2px 4px",
                        padding: "6px 12px",
                        "&.Mui-selected": {
                          backgroundColor: "rgba(0, 81, 155, 0.08)",
                          color: "#0055A5",
                          fontWeight: "bold",
                          "&:hover": {
                            backgroundColor: "rgba(0, 81, 155, 0.12)",
                          },
                        },
                      },
                    },
                  },
                },
              }}
              sx={{
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                border: "1px solid rgba(0, 0, 0, 0.15)",
                borderRadius: "6px",
                backgroundColor: "background.paper",
                "&:hover": {
                  borderColor: "rgba(0, 0, 0, 0.24)",
                },
                "& .MuiSelect-select": {
                  py: "4px",
                  pl: "10px",
                  pr: "24px !important",
                },
              }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={15}>15</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Pagination
          count={cantidadPaginas}
          onChange={handleChangeNumeroPagina}
          page={paginaSeleccionada}
          shape="rounded"
          renderItem={(item) => (
            <PaginationItem
              slots={{
                previous: ArrowBackIcon,
                next: ArrowForwardIcon,
              }}
              sx={{
                borderRadius: "8px",
                "&.Mui-selected": {
                  bgcolor: "#0055A5 !important",
                  color: "#FFFFFF !important",
                  "&:hover": {
                    bgcolor: "#004080 !important",
                  },
                },
              }}
              {...item}
            />
          )}
        />
      </Box>
    </ThemeProvider>
  );
}
