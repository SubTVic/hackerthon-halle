import type { CanonicalRequest, Channel } from "../../canonical";

interface Props {
  raw: string;
  request: CanonicalRequest;
  channel: Channel;
}

const CHANNEL_LABEL: Record<Channel, string> = {
  email: "E-Mail",
  letter: "Brief",
  fax: "Fax",
  portal: "Online-Portal",
  phone: "Telefon",
  sms: "SMS",
};

function Val({ v }: { v: string | number | null | undefined }) {
  if (v === null || v === undefined || v === "") {
    return <span className="field__value field__value--empty">nicht angegeben</span>;
  }
  return <span className="field__value">{String(v)}</span>;
}

export function ParsedDataView({ raw, request: r, channel }: Props) {
  const op = r.parties.find((p) => p.role === "operator") ?? r.parties[0];
  const inv = r.installation.components[0];

  return (
    <section className="card">
      <div className="card__title">
        <span className="card__title-icon">{"📋"}</span>
        Erkannte Antragsdaten
        <span className="badge badge--info">{CHANNEL_LABEL[channel]}</span>
      </div>

      <details style={{ marginBottom: 16 }}>
        <summary style={{ cursor: "pointer", color: "#6b7280", fontSize: 13 }}>
          Originaltext anzeigen
        </summary>
        <pre className="raw-msg" style={{ marginTop: 8 }}>{raw}</pre>
      </details>

      <div className="parsed">
        <div className="parsed__group">
          <div className="parsed__group-title">Anlagenbetreiber</div>
          <div className="field"><span className="field__label">Name</span><Val v={op?.name} /></div>
          <div className="field"><span className="field__label">Vorname</span><Val v={op?.firstName} /></div>
          <div className="field"><span className="field__label">Firma</span><Val v={op?.company} /></div>
          <div className="field"><span className="field__label">E-Mail</span><Val v={op?.contact.email} /></div>
          <div className="field"><span className="field__label">Telefon</span><Val v={op?.contact.phone} /></div>
        </div>

        <div className="parsed__group">
          <div className="parsed__group-title">Standort der Anlage</div>
          {r.installation.locationKind === "cadastral" ? (
            <>
              <div className="field"><span className="field__label">Angabe über</span><Val v="Flurdaten" /></div>
              <div className="field"><span className="field__label">Gemarkung</span><Val v={r.installation.cadastral.district} /></div>
              <div className="field"><span className="field__label">Flurstück</span><Val v={r.installation.cadastral.parcel} /></div>
            </>
          ) : (
            <>
              <div className="field"><span className="field__label">Angabe über</span><Val v="Postalische Adresse" /></div>
              <div className="field"><span className="field__label">Straße</span><Val v={r.installation.siteAddress.street} /></div>
              <div className="field"><span className="field__label">Hausnummer</span><Val v={r.installation.siteAddress.no} /></div>
            </>
          )}
          <div className="field"><span className="field__label">PLZ</span><Val v={r.installation.siteAddress.zip} /></div>
          <div className="field"><span className="field__label">Ort</span><Val v={r.installation.siteAddress.city} /></div>
        </div>

        <div className="parsed__group">
          <div className="parsed__group-title">Anlage</div>
          <div className="field"><span className="field__label">Typ</span><Val v="Photovoltaik (PV)" /></div>
          <div className="field"><span className="field__label">Wirkleistung</span><Val v={r.installation.powerKw != null ? `${r.installation.powerKw} kW` : null} /></div>
          <div className="field"><span className="field__label">Scheinleistung</span><Val v={r.installation.apparentPowerKva != null ? `${r.installation.apparentPowerKva} kVA` : null} /></div>
        </div>

        <div className="parsed__group">
          <div className="parsed__group-title">Wechselrichter</div>
          <div className="field"><span className="field__label">Hersteller</span><Val v={inv?.manufacturer} /></div>
          <div className="field"><span className="field__label">Typ</span><Val v={inv?.model} /></div>
          <div className="field"><span className="field__label">Zertifikat</span><Val v={inv?.certId} /></div>
        </div>
      </div>
    </section>
  );
}
