// ============================================================================
// KANONISCHES SCHEMA — Single Source of Truth
// ============================================================================
// Dieses Modul ist das Herzstück. Es ist das EINZIGE, woran ingest/, validate/,
// adapters/ und respond/ gekoppelt sind. Bewusst generisch gehalten und NICHT
// an VDE-Feldnummern gekoppelt — das Mapping auf VDE passiert erst im Adapter
// (adapters/vde.ts).
//
// Status: Typen sind vollständig (real). Die Feld-Registry mit
// required/precondition pro PV-Feld lebt in ./fields.ts.
// ============================================================================

export type Channel = "email" | "letter" | "fax" | "portal" | "phone";

export type ApplicantRole =
  | "operator" // Anlagenbetreiber / Anschlussnutzer
  | "owner" // Anschlussnehmer
  | "installer" // Elektrofachbetrieb / Anlagenerrichter
  | "invoice_recipient"; // Rechnungsempfänger

export type InstallationType =
  | "pv"
  | "storage"
  | "heatpump"
  | "charging"
  | "ac_unit";

export type AttachmentKind =
  | "site_plan" // Lageplan
  | "metering_concept" // Messkonzept (einpolige Darstellung)
  | "wiring_diagram" // einpolige Darstellung
  | "unit_certificate" // Einheitenzertifikat
  | "proof";

export interface Address {
  street: string | null;
  no: string | null;
  zip: string | null;
  city: string | null;
  district?: string | null; // Ortsteil
}

export interface Cadastral {
  district: string | null; // Gemarkung
  parcel: string | null; // Flurstück Zähler/Nenner
}

export interface Contact {
  email: string | null;
  phone: string | null;
}

export interface Party {
  role: ApplicantRole;
  name: string | null;
  firstName?: string | null;
  company: string | null;
  address: Address;
  contact: Contact;
}

export interface Component {
  kind: string; // z.B. "inverter" | "pv_module" | "na_protection"
  manufacturer: string | null;
  model: string | null;
  certId: string | null; // Einheitenzertifikat / ZEREZ-ID
}

export interface Installation {
  type: InstallationType;
  /** Standortangabe: postalische Adresse ODER Flurdaten (siehe precondition). */
  locationKind?: "postal" | "cadastral" | null;
  siteAddress: Address;
  cadastral: Cadastral;
  powerKw: number | null; // Summe max. Wirkleistung
  apparentPowerKva?: number | null; // Summe max. Scheinleistung
  components: Component[];
}

export interface Commercial {
  marketingForm: string | null; // Gewünschte Veräußerungsform der Einspeisung
  iban: string | null;
}

export interface Attachment {
  kind: AttachmentKind;
  present: boolean;
}

export interface Meta {
  sourceRaw: string; // Originaltext der Eingangsnachricht
  /** Feldpfad -> Konfidenz des Parsers (0..1). Pfad wie "applicant.contact.email". */
  confidence: Record<string, number>;
}

/**
 * Kanonische Netzanschluss-Anfrage. Stabiles Zwischenformat.
 * Felder sind absichtlich nullable: eine eingehende Anfrage ist fast immer
 * lückenhaft — die Lückenprüfung macht validate/.
 */
export interface CanonicalRequest {
  requestId: string;
  channel: Channel;
  receivedAt: string; // ISO-8601
  /** Beteiligte Parteien. Mind. operator; owner/installer je nach Fall. */
  parties: Party[];
  installation: Installation;
  commercial: Commercial;
  attachments: Attachment[];
  _meta: Meta;
}
