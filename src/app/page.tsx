"use client";
import supabase from "@/supabase";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isToday from "dayjs/plugin/isToday";
dayjs.extend(relativeTime);
dayjs.extend(isToday);
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

function canHaveADrink(transactions: Transaction[]): boolean {
  if (transactions.length == 0) return true;
  else
    return (
      dayjs(transactions[0].timestamp).diff(now, "minutes") > 30 &&
      transactions.length < 5
    );
}
const now: dayjs.Dayjs = dayjs();

const today: dayjs.Dayjs = dayjs().startOf("day");

console.log(now);
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
  return (
    <div>
      <h2>Next Pret</h2>
      <p>
        Last drink today was{" "}
        {transactions.length > 0 &&
          now.diff(dayjs(transactions[0].timestamp), "minutes")}{" "}
        minutes ago
      </p>
      <button
        onClick={insertTransaction}
        disabled={!canHaveADrink(transactions)}
      >
        Have a Drink!
      </button>
      <p>Today we had {transactions.length}/5 drinks</p>
      {transactions.map((t) => {
        const tDate = dayjs(t.timestamp);
        return (
          <li key={t.id}>
            {tDate.format("HH:mm")} - {displayDate(tDate)}x{" "}
            {tDate.isToday() ? "today" : "not"}
          </li>
        );
      })}
    </div>
  );
}
