import { RoutePageLayout } from "@/components/RoutePageLayout";
import { MittichaOfflinePage } from "@/components/MittichaChat";

// Test va tushuntirish offline; kunlik reja ixtiyoriy himoyalangan API orqali tuziladi.
export default function MittichaPage() {
  return (
    <RoutePageLayout
      eyebrow="O'QISHDAGI OFFLINE DO'STING"
      title="Mitticha"
      description="Test va tushuntirishlar offline ishlaydi. Kunlik reja, yozma ish tahlili va rasm o'qish ixtiyoriy server kalitidan foydalanadi."
    >
      <MittichaOfflinePage />
    </RoutePageLayout>
  );
}
