// import InfiniteScrollTable from "@/components/TablseInfiniteScroll";
import Table2 from "@/components/Table2";
import Table from "../components/Table";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center">
      <Table2 />
      <Table />
      {/* <InfiniteScrollTable /> */}
    </div>
  );
}
