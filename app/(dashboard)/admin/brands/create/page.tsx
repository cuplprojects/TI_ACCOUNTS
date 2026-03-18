import BrandEditPage from "../[id]/page";

export default function CreateBrandPage() {
  return <BrandEditPage params={Promise.resolve({ id: "create" })} />;
}
