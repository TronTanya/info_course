/**
 * Шаблон PDF-сертификата (@react-pdf/renderer).
 * A4 landscape, один лист без разрывов. Шрифты: lib/certificate-pdf-fonts.ts
 */
import {
  Defs,
  Document,
  G,
  Image,
  LinearGradient,
  Page,
  Path,
  Stop,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import { formatCertificateVerifyUrlForPdf } from "@/lib/certificate-pdf-format";

const c = {
  pageBg: "#e2e8f0",
  paper: "#fffef9",
  ink: "#0c1a2e",
  muted: "#64748b",
  gold: "#a67c00",
  goldLight: "#faf6eb",
  cyan: "#0e7490",
  cyanLight: "#ecfeff",
  border: "#cbd5e1",
  navy: "#0b1f33",
} as const;

const styles = StyleSheet.create({
  page: {
    fontFamily: "CertificateSans",
    backgroundColor: c.pageBg,
    padding: 12,
  },
  sheet: {
    flex: 1,
    borderWidth: 2,
    borderColor: c.gold,
    borderRadius: 4,
    padding: 2,
    backgroundColor: c.gold,
  },
  inner: {
    flex: 1,
    backgroundColor: c.paper,
    borderWidth: 1,
    borderColor: c.border,
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: c.cyan,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    paddingTop: 2,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "58%",
  },
  brandWord: {
    marginLeft: 9,
  },
  brandName: {
    fontSize: 14,
    fontWeight: 700,
    color: c.navy,
    letterSpacing: 0.5,
  },
  brandTag: {
    fontSize: 7.5,
    color: c.muted,
    marginTop: 2,
    lineHeight: 1.25,
  },
  qrCol: {
    alignItems: "center",
    width: 78,
  },
  qrBox: {
    padding: 3,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 4,
    backgroundColor: "#ffffff",
  },
  qr: {
    width: 62,
    height: 62,
  },
  qrHint: {
    fontSize: 6.5,
    color: c.muted,
    marginTop: 3,
    textAlign: "center",
    lineHeight: 1.2,
    maxWidth: 78,
  },
  hero: {
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 7,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: c.border,
    backgroundColor: c.goldLight,
  },
  eyebrow: {
    fontSize: 7,
    letterSpacing: 2.4,
    color: c.gold,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  title: {
    fontSize: 21,
    fontWeight: 700,
    color: c.navy,
    textTransform: "uppercase",
    letterSpacing: 2.8,
    lineHeight: 1.1,
  },
  subtitle: {
    fontSize: 8.5,
    color: c.muted,
    marginTop: 4,
    textAlign: "center",
    lineHeight: 1.35,
    maxWidth: 420,
  },
  recipientLabel: {
    fontSize: 7.5,
    color: c.muted,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginTop: 8,
    marginBottom: 3,
    textAlign: "center",
  },
  recipientName: {
    fontWeight: 700,
    color: c.ink,
    textAlign: "center",
    lineHeight: 1.15,
    maxWidth: 500,
  },
  bodyLine: {
    fontSize: 9.5,
    color: c.muted,
    marginTop: 5,
    textAlign: "center",
    lineHeight: 1.3,
  },
  courseLine: {
    fontWeight: 700,
    color: c.cyan,
    textAlign: "center",
    marginTop: 3,
    lineHeight: 1.2,
    maxWidth: 480,
  },
  chipsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginHorizontal: 6,
    backgroundColor: c.cyanLight,
    minWidth: 118,
    alignItems: "center",
  },
  chipLabel: {
    fontSize: 6.5,
    color: c.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  chipValue: {
    fontSize: 10.5,
    fontWeight: 700,
    color: c.ink,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 6,
    paddingTop: 7,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  metaCol: {
    width: "52%",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
    alignItems: "flex-start",
  },
  metaLabel: {
    fontSize: 7.5,
    color: c.muted,
    width: "40%",
    lineHeight: 1.25,
  },
  metaValue: {
    fontSize: 7.5,
    color: c.ink,
    width: "58%",
    textAlign: "right",
    lineHeight: 1.25,
  },
  metaValueMono: {
    fontSize: 6.5,
    color: c.ink,
    width: "58%",
    textAlign: "right",
    lineHeight: 1.3,
  },
  signCol: {
    width: "44%",
    alignItems: "flex-end",
  },
  signTitle: {
    fontSize: 7,
    color: c.muted,
    marginBottom: 2,
    textAlign: "right",
    lineHeight: 1.25,
  },
  signOrg: {
    fontSize: 9.5,
    fontWeight: 700,
    color: c.navy,
    textAlign: "right",
    lineHeight: 1.2,
  },
  signLine: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: c.gold,
    width: 150,
    paddingTop: 4,
    fontSize: 7.5,
    color: c.muted,
    textAlign: "right",
  },
  verifyBand: {
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  verifyBandLabel: {
    fontSize: 6.5,
    color: c.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  verifyBandUrl: {
    fontSize: 7,
    color: c.navy,
    lineHeight: 1.35,
  },
  regBar: {
    marginTop: 6,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: c.border,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  regText: {
    fontSize: 7.5,
    color: c.muted,
  },
  regNum: {
    fontSize: 8,
    fontWeight: 700,
    color: c.navy,
    marginLeft: 4,
  },
  regId: {
    fontSize: 6.5,
    color: c.muted,
    marginLeft: 10,
  },
});

export type CertificatePdfPayload = {
  certificateId: string;
  fullName: string;
  courseTitle: string;
  courseHours: number;
  courseStartedAt: Date;
  courseCompletedAt: Date;
  totalScore: number;
  certificateNumber: string;
  verifyUrl: string;
  issuedAt: Date;
  organizationLine: string;
  signatoryLine: string;
  qrDataUrl: string;
};

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" }).format(d);
}

function courseFontSize(title: string): number {
  if (title.length > 72) return 9;
  if (title.length > 48) return 10;
  return 11.5;
}

function nameFontSize(name: string): number {
  if (name.length > 42) return 15;
  if (name.length > 28) return 17;
  return 19;
}

function CertificateBrandMarkPdf() {
  return (
    <Svg width={38} height={38} viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id="certSh" x1={18} y1={6} x2={46} y2={58} gradientUnits="userSpaceOnUse">
          <Stop stopColor="#0f2847" offset="0" />
          <Stop stopColor="#1e3a5f" offset="0.55" />
          <Stop stopColor="#0e7490" offset="1" />
        </LinearGradient>
      </Defs>
      <G>
        <Path
          fill="url(#certSh)"
          stroke="#b8860b"
          strokeWidth={1.2}
          d="M32 5 50 13v14c0 11-7.5 20.5-18 24.5L32 56l-2-4.5C19.5 47.5 12 38 12 27V13L32 5Z"
        />
        <Path
          stroke="#22d3ee"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
          d="M39 22.5c-8-3.2-17 1-17 11.5s9 14.7 17 11.5"
        />
      </G>
    </Svg>
  );
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={mono ? styles.metaValueMono : styles.metaValue}>{value}</Text>
    </View>
  );
}

export function CertificatePdfDocument(p: CertificatePdfPayload) {
  const courseSize = courseFontSize(p.courseTitle);
  const nameSize = nameFontSize(p.fullName);
  const verifyLine = formatCertificateVerifyUrlForPdf(p.verifyUrl);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page} wrap={false}>
        <View style={styles.sheet} wrap={false}>
          <View style={styles.inner} wrap={false}>
            <View style={styles.accentBar} fixed />

            <View style={styles.headerRow} wrap={false}>
              <View style={styles.brandRow}>
                <CertificateBrandMarkPdf />
                <View style={styles.brandWord}>
                  <Text style={styles.brandName}>CyberEdu Academy</Text>
                  <Text style={styles.brandTag}>Программа по информационной безопасности</Text>
                </View>
              </View>
              <View style={styles.qrCol} wrap={false}>
                <View style={styles.qrBox}>
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <Image src={p.qrDataUrl} style={styles.qr} />
                </View>
                <Text style={styles.qrHint}>Сканируйте для проверки подлинности</Text>
              </View>
            </View>

            <View style={styles.hero} wrap={false}>
              <Text style={styles.eyebrow}>Официальный документ</Text>
              <Text style={styles.title}>Сертификат</Text>
              <Text style={styles.subtitle}>
                о успешном прохождении образовательной программы CyberEdu Academy
              </Text>
            </View>

            <Text style={styles.recipientLabel}>Настоящим подтверждается, что</Text>
            <Text style={[styles.recipientName, { fontSize: nameSize }]}>{p.fullName}</Text>
            <Text style={styles.bodyLine}>успешно завершил(а) программу</Text>
            <Text style={[styles.courseLine, { fontSize: courseSize }]}>«{p.courseTitle}»</Text>

            <View style={styles.chipsRow} wrap={false}>
              <View style={styles.chip}>
                <Text style={styles.chipLabel}>Объём программы</Text>
                <Text style={styles.chipValue}>{p.courseHours} ак. ч.</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipLabel}>Итоговый результат</Text>
                <Text style={styles.chipValue}>{p.totalScore} баллов</Text>
              </View>
            </View>

            <View style={styles.bottomRow} wrap={false}>
              <View style={styles.metaCol}>
                <MetaRow label="ID записи" value={p.certificateId} mono />
                <MetaRow label="Номер в реестре" value={p.certificateNumber} />
                <MetaRow label="Дата выдачи" value={fmtDate(p.issuedAt)} />
                <MetaRow label="Начало обучения" value={fmtDate(p.courseStartedAt)} />
                <MetaRow label="Завершение" value={fmtDate(p.courseCompletedAt)} />
                <View style={styles.verifyBand}>
                  <Text style={styles.verifyBandLabel}>Публичная проверка</Text>
                  <Text style={styles.verifyBandUrl}>{verifyLine}</Text>
                </View>
              </View>
              <View style={styles.signCol}>
                <Text style={styles.signTitle}>Подпись уполномоченного лица</Text>
                <Text style={styles.signOrg}>{p.organizationLine}</Text>
                <Text style={styles.signLine}>{p.signatoryLine}</Text>
              </View>
            </View>

            <View style={styles.regBar} wrap={false}>
              <Text style={styles.regText}>Реестр CyberEdu ·</Text>
              <Text style={styles.regNum}>{p.certificateNumber}</Text>
              <Text style={styles.regId}>ID: {p.certificateId}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
