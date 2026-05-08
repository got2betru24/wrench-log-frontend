import { useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { ErrorOutline as ErrorIcon } from "@mui/icons-material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useImportEntriesCsv } from "../../hooks";

// ---------------------------------------------------------------------------
// CSV parser — handles quoted fields containing commas
// ---------------------------------------------------------------------------
interface PreviewRow {
  Date: string;
  Odometer: string;
  Title: string;
  Shop: string;
  Notes: string;
}

function parseCsvRow(line: string): string[] {
  const vals: string[] = [];
  let cur = "";
  let inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; continue; }
    if (ch === "," && !inQ) { vals.push(cur.trim()); cur = ""; continue; }
    cur += ch;
  }
  vals.push(cur.trim());
  return vals;
}

function parseCsvPreview(text: string): PreviewRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = parseCsvRow(lines[0]).map((h) => h.replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const vals = parseCsvRow(line);
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""])) as PreviewRow;
  });
}

// ---------------------------------------------------------------------------
// Client-side validation — mirrors backend rules
// ---------------------------------------------------------------------------
const DATE_FORMATS = [
  /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,   // MM/DD/YYYY
  /^(\d{4})-(\d{2})-(\d{2})$/,          // YYYY-MM-DD
  /^(\d{1,2})-(\d{1,2})-(\d{4})$/,      // MM-DD-YYYY
];

function isValidDate(raw: string): boolean {
  return DATE_FORMATS.some((re) => re.test(raw.trim()));
}

function isValidOdometer(raw: string): boolean {
  return /^\d[\d,]*$/.test(raw.trim());
}

function validateRow(row: PreviewRow): string[] {
  const errors: string[] = [];
  if (!isValidDate(row.Date))
    errors.push(`Invalid date "${row.Date}" (expected MM/DD/YYYY)`);
  if (!isValidOdometer(row.Odometer))
    errors.push(`Invalid odometer "${row.Odometer}"`);
  if (!row.Title.trim())
    errors.push("Title is required");
  return errors;
}

// ---------------------------------------------------------------------------

interface Props {
  open: boolean;
  vehicleId: number;
  onClose: () => void;
  onSuccess: (imported: number, skipped: number) => void;
}

type Step = "pick" | "preview" | "done";

export default function ImportEntriesDialog({ open, vehicleId, onClose, onSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("pick");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<Map<number, string[]>>(new Map());
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutate, isPending, reset } = useImportEntriesCsv(vehicleId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setServerError(null);
    reset();
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCsvPreview(text);
      const errs = new Map<number, string[]>();
      rows.forEach((row, i) => {
        const rowErrs = validateRow(row);
        if (rowErrs.length) errs.set(i, rowErrs);
      });
      setPreview(rows);
      setValidationErrors(errs);
      setStep("preview");
    };
    reader.readAsText(f);
  };

  const invalidCount = validationErrors.size;
  const validCount = preview.length - invalidCount;

  const handleImport = () => {
    if (!file) return;
    const skipErrors = invalidCount > 0;
    mutate(
      { file, skipErrors },
      {
        onSuccess: (result) => {
          setStep("done");
          onSuccess(result.imported, result.skipped);
        },
        onError: (err: any) => {
          const detail = err?.response?.data?.detail;
          setServerError(
            typeof detail === "string"
              ? detail
              : detail?.message ?? "Import failed. Please check your file.",
          );
        },
      },
    );
  };

  const handleClose = () => {
    setStep("pick");
    setFile(null);
    setPreview([]);
    setValidationErrors(new Map());
    setServerError(null);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Import maintenance history</DialogTitle>

      <DialogContent dividers>
        {/* ── Step: pick ─────────────────────────────────────── */}
        {step === "pick" && (
          <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Upload a CSV with columns:{" "}
              <Box component="span" sx={{ fontFamily: "DM Mono, monospace" }}>
                Date, Odometer, Title, Shop, Notes
              </Box>
            </Typography>
            <Button
              variant="outlined"
              startIcon={<UploadFileIcon />}
              onClick={() => inputRef.current?.click()}
            >
              Choose file
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <Typography variant="caption" color="text.disabled">
              Entries are imported as free-form history (not linked to schedule items).
            </Typography>
          </Stack>
        )}

        {/* ── Step: preview ──────────────────────────────────── */}
        {step === "preview" && (
          <Stack spacing={2}>
            {/* Summary line */}
            {invalidCount === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {preview.length} row{preview.length !== 1 ? "s" : ""} ready to import from{" "}
                <strong>{file?.name}</strong>.
              </Typography>
            ) : (
              <Alert severity="warning">
                {validCount} row{validCount !== 1 ? "s" : ""} ready,{" "}
                {invalidCount} row{invalidCount !== 1 ? "s" : ""} have issues (highlighted below).
                Clicking "Import valid rows" will skip the problem rows.
              </Alert>
            )}

            {serverError && <Alert severity="error">{serverError}</Alert>}

            <Box sx={{ maxHeight: 360, overflow: "auto" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500, width: 24 }} />
                    {["Date", "Odometer", "Title", "Shop", "Notes"].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 500 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.map((row, i) => {
                    const errs = validationErrors.get(i);
                    const hasError = !!errs?.length;
                    return (
                      <TableRow
                        key={i}
                        hover
                        sx={hasError ? {
                          bgcolor: (t) => t.palette.mode === 'dark'
                            ? 'rgba(211,47,47,0.15)'
                            : 'rgba(211,47,47,0.08)',
                          borderLeft: '3px solid',
                          borderColor: 'error.main',
                        } : undefined}
                      >
                        <TableCell sx={{ py: 0.5, px: 1 }}>
                          {hasError && (
                            <Tooltip title={errs!.join(" · ")} arrow>
                              <ErrorIcon
                                fontSize="small"
                                color="error"
                                sx={{ display: "block" }}
                              />
                            </Tooltip>
                          )}
                        </TableCell>
                        <TableCell>{row.Date}</TableCell>
                        <TableCell>{row.Odometer}</TableCell>
                        <TableCell>{row.Title}</TableCell>
                        <TableCell>{row.Shop}</TableCell>
                        <TableCell sx={{
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                          {row.Notes}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Stack>
        )}

        {/* ── Step: done ─────────────────────────────────────── */}
        {step === "done" && (
          <Stack spacing={1} alignItems="center" sx={{ py: 4 }}>
            <Alert severity="success" sx={{ width: "100%" }}>
              Import complete.
            </Alert>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isPending}>
          {step === "done" ? "Close" : "Cancel"}
        </Button>
        {step === "preview" && (
          <>
            <Button onClick={() => { setStep("pick"); setServerError(null); reset(); }}>
              Change file
            </Button>
            <Button
              variant="contained"
              onClick={handleImport}
              disabled={isPending || validCount === 0}
              startIcon={isPending ? <CircularProgress size={16} /> : undefined}
            >
              {isPending
                ? "Importing…"
                : invalidCount > 0
                ? `Import ${validCount} valid row${validCount !== 1 ? "s" : ""}`
                : `Import ${preview.length} row${preview.length !== 1 ? "s" : ""}`}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}