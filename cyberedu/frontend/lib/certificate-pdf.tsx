import path from "node:path";
import { Defs, Document, Font, G, Image, LinearGradient, Page, Path, Stop, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";

const cwd = process.cwd();

Font.register({
  family: "Roboto",
  fonts: [
    { src: path.join(cwd, "node_modules/@fontsource/roboto/files/roboto-latin-400-normal.woff2") },
    { src: path.join(cwd, "node_modules/@fontsource/roboto/files/roboto-latin-ext-400-normal.woff2") },
    { src: path.join(cwd, "node_modules/@fontsource/roboto/files/roboto-cyrillic-400-normal.woff2") },
    { src: path.join(cwd, "node_modules/@fontsource/roboto/files/roboto-cyrillic-ext-400-normal.woff2") },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    backgroundColor: "#0b1220",
    padding: 36,
    color: "#e2e8f0",
  },
  outerFrame: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#22d3ee",
    borderRadius: 4,
    padding: 28,
    justifyContent: "space-between",
  },
  innerFrame: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 2,
    padding: 32,
  },
  title: {
    fontSize: 28,
    letterSpacing: 4,
    textAlign: "center",
    color: "#22d3ee",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 11,
    textAlign: "center",
    color: "#94a3b8",
    marginBottom: 24,
  },
  body: {
    fontSize: 13,
    lineHeight: 1.65,
    textAlign: "center",
    color: "#cbd5e1",
    marginBottom: 20,
  },
  highlight: {
    color: "#f8fafc",
    fontWeight: 400,
  },
  grid: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    paddingTop: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    fontSize: 11,
    color: "#94a3b8",
  },
  rowValue: {
    color: "#e2e8f0",
    maxWidth: "62%",
    textAlign: "right",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 28,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  signBlock: {
    maxWidth: "55%",
  },
  signTitle: {
    fontSize: 10,
    color: "#64748b",
    marginBottom: 4,
  },
  signOrg: {
    fontSize: 12,
    color: "#cbd5e1",
  },
  signLine: {
    marginTop: 28,
    borderTopWidth: 1,
    borderTopColor: "#475569",
    width: 200,
    fontSize: 9,
    color: "#64748b",
    paddingTop: 4,
  },
  certNumber: {
    fontSize: 10,
    color: "#64748b",
    fontFamily: "Roboto",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  brandWord: {
    marginLeft: 12,
  },
  brandName: {
    fontSize: 15,
    color: "#22d3ee",
    fontWeight: 700,
    letterSpacing: 0.5,
  },
  brandTag: {
    fontSize: 8.5,
    color: "#64748b",
    marginTop: 3,
  },
  qrWrap: {
    alignItems: "flex-end",
  },
  qr: {
    width: 96,
    height: 96,
  },
  verifyHint: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 4,
    maxWidth: 120,
    textAlign: "right",
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

function CertificateBrandMarkPdf() {
  return (
    <Svg width={46} height={46} viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id="certSh" x1={18} y1={6} x2={46} y2={58} gradientUnits="userSpaceOnUse">
          <Stop stopColor="#0f2847" offset="0" />
          <Stop stopColor="#1e3a5f" offset="0.55" />
          <Stop stopColor="#0e7490" offset="1" />
        </LinearGradient>
        <LinearGradient id="certC" x1={24} y1={22} x2={38} y2={46} gradientUnits="userSpaceOnUse">
          <Stop stopColor="#ecfdf5" offset="0" />
          <Stop stopColor="#a5f3fc" offset="1" />
        </LinearGradient>
      </Defs>
      <G>
        <Path
          fill="url(#certSh)"
          stroke="#22d3ee"
          strokeWidth={1.2}
          strokeLinejoin="round"
          d="M32 5 50 13v14c0 11-7.5 20.5-18 24.5L32 56l-2-4.5C19.5 47.5 12 38 12 27V13L32 5Z"
        />
        <Path
          stroke="#34d399"
          strokeWidth={0.85}
          strokeOpacity={0.45}
          fill="none"
          d="M32 9.5 46.5 15.5V27c0 9-6 16.8-14.5 20.2"
        />
        <Path
          stroke="#6ee7b7"
          strokeWidth={1.05}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          d="M15 30h5.5l3.5-5.5 5.5 9 4-7H49"
        />
        <Path
          stroke="url(#certC)"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          d="M39 22.5c-8-3.2-17 1-17 11.5s9 14.7 17 11.5"
        />
        <Path fill="#f8fafc" d="M23 45h9v8H23v-8Zm10 0h9v8H33v-8Z" />
        <Path stroke="#99f6e4" strokeWidth={0.85} strokeLinecap="round" fill="none" d="M32 45v8M27 47.5h10" />
        <Path fill="#22d3ee" d="m45.5 13 1 2.2 2.4.3-1.8 1.6.4 2.4-2.1-1.1-2.1 1.1.4-2.4-1.8-1.6 2.4-.3 1-2.2Z" />
      </G>
    </Svg>
  );
}

export function CertificatePdfDocument(p: CertificatePdfPayload) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.outerFrame}>
          <View style={styles.innerFrame}>
            <View style={styles.brandRow}>
              <CertificateBrandMarkPdf />
              <View style={styles.brandWord}>
                <Text style={styles.brandName}>CyberEdu</Text>
                <Text style={styles.brandTag}>Информационная безопасность</Text>
              </View>
            </View>
            <Text style={styles.title}>Сертификат</Text>
            <Text style={styles.subtitle}>об успешном прохождении образовательной программы</Text>
            <Text style={styles.body}>
              Настоящим подтверждается, что{" "}
              <Text style={styles.highlight}>{p.fullName}</Text> завершил(а) курс{" "}
              <Text style={styles.highlight}>«{p.courseTitle}»</Text> объёмом{" "}
              <Text style={styles.highlight}>{p.courseHours}</Text> академических часов с итоговым результатом{" "}
              <Text style={styles.highlight}>{p.totalScore}</Text> баллов.
            </Text>
            <View style={styles.grid}>
              <View style={styles.row}>
                <Text>Дата начала обучения</Text>
                <Text style={styles.rowValue}>{fmtDate(p.courseStartedAt)}</Text>
              </View>
              <View style={styles.row}>
                <Text>Дата завершения</Text>
                <Text style={styles.rowValue}>{fmtDate(p.courseCompletedAt)}</Text>
              </View>
              <View style={styles.row}>
                <Text>Дата выдачи сертификата</Text>
                <Text style={styles.rowValue}>{fmtDate(p.issuedAt)}</Text>
              </View>
              <View style={styles.row}>
                <Text>Код проверки</Text>
                <Text style={styles.rowValue}>{p.verificationCode}</Text>
              </View>
            </View>
            <View style={styles.footer}>
              <View style={styles.signBlock}>
                <Text style={styles.signTitle}>Подпись уполномоченного лица</Text>
                <Text style={styles.signOrg}>{p.organizationLine}</Text>
                <Text style={styles.signLine}>{p.signatoryLine}</Text>
              </View>
              <View style={styles.qrWrap}>
                {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image без alt */}
                <Image src={p.qrDataUrl} style={styles.qr} />
                <Text style={styles.verifyHint}>Проверка подлинности по QR или ссылке</Text>
              </View>
            </View>
            <Text style={[styles.certNumber, { marginTop: 12 }]}>
              Регистрационный номер сертификата: {p.certificateNumber}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
