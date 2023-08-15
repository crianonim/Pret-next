"use client";
import supabase from "@/supabase";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
async function insertTransaction() {
  const { data, error } = await supabase
    .from("transactions")
    .insert([{ user_id: "4c647e9a-e2bb-4570-a9f7-0db2e5b4d41f" }])
    .select();
}

type Transaction = {
  id: string;
  user_id: string;
  timestamp: string;
};

function displayDate(date: dayjs.Dayjs) {
  const diff = now.diff(date, "minutes");
  return diff < 60 ? diff + " minutes ago" : date.fromNow();
}

function reasonsCantHaveADrink(transactions: Transaction[]): string[] {
  let reasons: string[] = [];
  if (transactions.length == 0) return reasons;
  const last = lastDrinkMinutesAgo(transactions);
  if (last < 30) reasons.push(`we had a drink ${last} minutes ago`);
  const howMany = transactions.length;
  if (howMany > 5) reasons.push(`we can't have more drinks, we had ${howMany}`);
  return reasons;
}

function lastDrinkMinutesAgo(transactions: Transaction[]): number {
  if (!transactions[0]) return -1;
  return now.diff(dayjs(transactions[0].timestamp), "minutes");
}

function canHaveADrink(transactions: Transaction[]): boolean {
  return reasonsCantHaveADrink(transactions).length === 0;
}
const now: dayjs.Dayjs = dayjs();

const today: dayjs.Dayjs = dayjs().startOf("day");

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const getTransactions = async () => {
    let { data: transactions, error } = await supabase
      .from("transactions")
      .select("id,timestamp,user_id")
      .gte("timestamp", today.toISOString());
    if (transactions)
      setTransactions(
        transactions.sort(
          (a, b) =>
            Number(new Date(b.timestamp)) - Number(new Date(a.timestamp))
        )
      );
  };

  useEffect(() => {
    getTransactions();
  }, []);
  const canUse = canHaveADrink(transactions);
  return (
    <div className="p-2 flex flex-col gap-2">
      <h2 className="flex justify-center text-lg mb-4">Five-a-Day 😜</h2>

      <p className={`${canUse ? "text-green-500" : "text-red-500"}`}>
        {canUse
          ? "We can have a drink"
          : "We can't have a drink because " +
            reasonsCantHaveADrink(transactions).join(" and ")}
      </p>
      <button
        onClick={insertTransaction}
        disabled={!canUse}
        className={`p-1 rounded border text-lg ${
          canUse ? "bg-green-500" : "bg-red-500"
        } text-white`}
      >
        {canUse ? "Track use" : "Can't use it now"}
      </button>
      <p>Today we had {transactions.length}/5 drinks</p>
      {transactions.map((t) => {
        const tDate = dayjs(t.timestamp);
        return (
          <li className="flex" key={t.id}>
            {tDate.format("HH:mm")} - {displayDate(tDate)}x{" "}
          </li>
        );
      })}
    </div>
  );
}
