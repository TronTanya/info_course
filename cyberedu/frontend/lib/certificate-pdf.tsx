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

const c = {
  pageBg: "#e8eef4",
  paper: "#fffef8",
  ink: "#0c1a2e",
  muted: "#5c6b7a",
  gold: "#b8860b",
  goldLight: "#f5ecd4",
  cyan: "#0e7490",
  cyanLight: "#e0f7fa",
  border: "#c5d0dc",
  navy: "#0b1f33",
} as const;

const styles = StyleSheet.create({
  page: {
    fontFamily: "CertificateSans",
    backgroundColor: c.pageBg,
    padding: 14,
  },
  /** Один лист: без переноса блоков на 2-ю страницу */
  sheet: {
    flex: 1,
    borderWidth: 2,
    borderColor: c.gold,
    borderRadius: 3,
    padding: 2,
    backgroundColor: c.gold,
  },
  inner: {
    flex: 1,
    backgroundColor: c.paper,
    borderWidth: 1,
    borderColor: c.border,
    paddingTop: 18,
    paddingBottom: 14,
    paddingHorizontal: 22,
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: c.cyan,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    paddingTop: 4,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "62%",
  },
  brandWord: {
    marginLeft: 10,
  },
  brandName: {
    fontSize: 15,
    fontWeight: 700,
    color: c.navy,
    letterSpacing: 0.4,
  },
  brandTag: {
    fontSize: 8,
    color: c.muted,
    marginTop: 2,
  },
  qrCol: {
    alignItems: "center",
    width: 76,
  },
  qrBox: {
    padding: 4,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 4,
    backgroundColor: "#ffffff",
  },
  qr: {
    width: 60,
    height: 60,
  },
  qrHint: {
    fontSize: 6.5,
    color: c.muted,
    marginTop: 3,
    textAlign: "center",
    maxWidth: 76,
  },
  hero: {
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: c.border,
    backgroundColor: c.goldLight,
  },
  eyebrow: {
    fontSize: 7,
    letterSpacing: 2.2,
    color: c.gold,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: c.navy,
    textTransform: "uppercase",
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 9,
    color: c.muted,
    marginTop: 4,
    textAlign: "center",
    maxWidth: 400,
  },
  recipientLabel: {
    fontSize: 8,
    color: c.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 10,
    marginBottom: 4,
  },
  recipientName: {
    fontSize: 20,
    fontWeight: 700,
    color: c.ink,
    textAlign: "center",
    maxWidth: 480,
  },
  bodyLine: {
    fontSize: 10,
    color: c.muted,
    marginTop: 6,
  },
  courseLine: {
    fontSize: 12,
    fontWeight: 700,
    color: c.cyan,
    textAlign: "center",
    marginTop: 4,
    maxWidth: 460,
  },
  chipsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginHorizontal: 8,
    backgroundColor: c.cyanLight,
    minWidth: 120,
    alignItems: "center",
  },
  chipLabel: {
    fontSize: 7,
    color: c.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  chipValue: {
    fontSize: 11,
    fontWeight: 700,
    color: c.ink,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  metaCol: {
    width: "48%",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 8,
    color: c.muted,
    width: "42%",
  },
  metaValue: {
    fontSize: 8,
    color: c.ink,
    width: "56%",
    textAlign: "right",
  },
  metaValueCode: {
    fontSize: 7,
    color: c.ink,
    width: "56%",
    textAlign: "right",
  },
  signCol: {
    width: "46%",
    alignItems: "flex-end",
  },
  signTitle: {
    fontSize: 7.5,
    color: c.muted,
    marginBottom: 3,
    textAlign: "right",
  },
  signOrg: {
    fontSize: 10,
    fontWeight: 700,
    color: c.navy,
    textAlign: "right",
  },
  signLine: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: c.gold,
    width: 160,
    paddingTop: 4,
    fontSize: 8,
    color: c.muted,
    textAlign: "right",
  },
  regBar: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: c.border,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  regText: {
    fontSize: 8,
    color: c.muted,
  },
  regNum: {
    fontSize: 8,
    fontWeight: 700,
    color: c.navy,
    marginLeft: 4,
  },
});

export type CertificatePdfPayload = {
  fullName: string;
  courseTitle: string;
  courseHours: number;
  courseStartedAt: Date;
  courseCompletedAt: Date;
  totalScore: number;
  certificateNumber: string;
  verificationCode: string;
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
  return 12;
}

function nameFontSize(name: string): number {
  if (name.length > 42) return 16;
  if (name.length > 28) return 18;
  return 20;
}

function CertificateBrandMarkPdf() {
  return (
    <Svg width={40} height={40} viewBox="0 0 64 64">
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

function CornerOrnament({ flip }: { flip?: boolean }) {
  return (
    <Svg
      width={28}
      height={28}
      viewBox="0 0 28 28"
      style={{
        position: "absolute",
        bottom: 8,
        ...(flip ? { right: 8 } : { left: 8 }),
        opacity: 0.35,
      }}
    >
      <Path
        d={flip ? "M4 24 L24 24 L24 4" : "M4 4 L24 4 L4 24"}
        stroke="#b8860b"
        strokeWidth={1.2}
        fill="none"
      />
    </Svg>
  );
}

function MetaRow({ label, value, code }: { label: string; value: string; code?: boolean }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={code ? styles.metaValueCode : styles.metaValue}>{value}</Text>
    </View>
  );
}

export function CertificatePdfDocument(p: CertificatePdfPayload) {
  const courseSize = courseFontSize(p.courseTitle);
  const nameSize = nameFontSize(p.fullName);

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
                  <Text style={styles.brandTag}>Информационная безопасность</Text>
                </View>
              </View>
              <View style={styles.qrCol} wrap={false}>
                <View style={styles.qrBox}>
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <Image src={p.qrDataUrl} style={styles.qr} />
                </View>
                <Text style={styles.qrHint}>Проверка по QR</Text>
              </View>
            </View>

            <View style={styles.hero} wrap={false}>
              <Text style={styles.eyebrow}>Официальный документ</Text>
              <Text style={styles.title}>Сертификат</Text>
              <Text style={styles.subtitle}>об успешном прохождении образовательной программы</Text>
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
                <MetaRow label="Начало обучения" value={fmtDate(p.courseStartedAt)} />
                <MetaRow label="Завершение" value={fmtDate(p.courseCompletedAt)} />
                <MetaRow label="Дата выдачи" value={fmtDate(p.issuedAt)} />
                <MetaRow label="Код проверки" value={p.verificationCode} code />
              </View>
              <View style={styles.signCol}>
                <Text style={styles.signTitle}>Подпись уполномоченного лица</Text>
                <Text style={styles.signOrg}>{p.organizationLine}</Text>
                <Text style={styles.signLine}>{p.signatoryLine}</Text>
              </View>
            </View>

            <View style={styles.regBar} wrap={false}>
              <Text style={styles.regText}>Регистрационный номер:</Text>
              <Text style={styles.regNum}>{p.certificateNumber}</Text>
            </View>

            <CornerOrnament />
            <CornerOrnament flip />
          </View>
        </View>
      </Page>
    </Document>
  );
}
