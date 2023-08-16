"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import logo from "../assets/pret-a-manger-logo.png";
import Login from "./login";
dayjs.extend(relativeTime);

type Transaction = {
  id: number;
  user_id: string;
  timestamp: string;
};

const supabase = createClientComponentClient();

function displayDate(date: Dayjs) {
  const diff = dayjs().diff(date, "minutes");
  return diff < 60 ? diff + " minutes ago" : date.fromNow();
}

type User = { user_id: string; email: string };

// Component
export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [appError, setAppError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [now, setNow] = useState<dayjs.Dayjs>(dayjs());
  const [lastRefreshed, setLastRefreshed] = useState<dayjs.Dayjs>(dayjs());
  console.log({ transactions });
  async function insertTransaction() {
    if (!user) return;
    const { data, error } = await supabase
      .from("transactions")
      .insert([{ user_id: user.user_id }])
      .select();
    console.log("INSERT", { data }, { error });

    if (error || !data?.[0]) {
      setAppError("There was a problem registering the use.");
      return;
    } else {
      const { id, user_id, timestamp } = data[0];
      setTransactions((tr) =>
        tr === null ? null : [{ id, user_id, timestamp }, ...tr]
      );
      setAppError(null);
    }
  }

  async function deleteTransaction(id: number) {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (!error) {
      setTransactions((ts) =>
        ts === null ? null : ts?.filter((t) => t.id != id)
      );
      setAppError(null);
    } else {
      setAppError("There was a problem deleting a transaction.");
    }
  }

  const getTransactions = async () => {
    let { data: transactions, error } = await supabase
      .from("transactions")
      .select("id,timestamp,user_id")
      .gte("timestamp", dayjs().startOf("day").toISOString());

    if (transactions) {
      setTransactions(
        transactions.sort(
          (a, b) =>
            Number(new Date(b.timestamp)) - Number(new Date(a.timestamp))
        )
      );
      setLastRefreshed(dayjs());
    }
  };
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          setUser({
            user_id: session.user.id,
            email: session.user.email || "user without email",
          });
        }
      }
    );
    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    getTransactions();
    supabase.auth.getSession().then((response) => {
      console.log({ response });
      if (response.error) {
        console.log("Login error: ", response.error);
      } else {
        if (!response.data.session) {
          console.log("No session found: ", response.error);
        } else
          setUser({
            user_id: response.data.session.user.id,
            email: response.data.session.user.email || "user without email",
          });
      }
    });
    setInterval(() => setNow(dayjs()), 1000 * 60);
  }, []);

  function lastDrinkMinutesAgo(transactions: Transaction[]): number {
    if (!transactions[0]) return -1;
    return now.diff(dayjs(transactions[0].timestamp), "minutes");
  }
  function reasonsCantHaveADrink(transactions: Transaction[]): string[] {
    let reasons: string[] = [];
    if (transactions.length == 0) return reasons;
    const last = lastDrinkMinutesAgo(transactions);
    if (last < 30) reasons.push(`we had a drink ${last} minutes ago`);
    const howMany = transactions.length;
    if (howMany > 5)
      reasons.push(`we can't have more drinks, we had ${howMany}`);
    return reasons;
  }
  function canHaveADrink(transactions: Transaction[]): boolean {
    return reasonsCantHaveADrink(transactions).length === 0;
  }
  const canUse = transactions !== null && canHaveADrink(transactions);

  return (
    <div className="flex justify-center text-slate-700">
      <div className="flex flex-col justify-between h-screen max-w-[800px] items-center">
        <div className="p-2 flex flex-col gap-2 items-center">
          <img className="max-w-[50%]" src={logo.src} alt="Logo" />
          <h2 className="flex justify-center text-lg mb-4">Five-a-Day 😜</h2>

          {!user ? (
            <Login supabaseClient={supabase} />
          ) : (
            <div className="flex justify-between gap-1 items-center w-full">
              <div>
                Logged in as <span className="text-black">{user.email}</span>.
              </div>
              <button
                onClick={() =>
                  supabase.auth.signOut().then(({ error }) => {
                    console.log("signout error", error);
                    setUser(null);
                  })
                }
                className="border border-red-500 bg-red-500 text-white p-1 rounded"
              >
                Sign out
              </button>
            </div>
          )}

          {transactions === null ? (
            <p>Loading ...</p>
          ) : (
            <div className="flex flex-col gap-2 w-full">
              <p className={`${canUse ? "text-green-500" : "text-red-500"}`}>
                {canUse
                  ? "We can order a drink! ☕️"
                  : "We can't have a drink 😭, because " +
                    reasonsCantHaveADrink(transactions).join(" and ")}
              </p>
              {user ? (
                <button
                  onClick={insertTransaction}
                  disabled={!canUse}
                  className={`p-1 rounded border text-lg ${
                    canUse ? "bg-green-500" : "bg-red-500"
                  } text-white`}
                >
                  {canUse ? "Track use" : "Can't use it now"}
                </button>
              ) : (
                <p>Log in to track usage</p>
              )}
              <p>Today we had {transactions.length}/5 drinks</p>
              <div className="flex justify-between items-center">
                <span>Last refreshed {displayDate(lastRefreshed)} </span>
                <button
                  className="p-1 rounded border bg-blue-400 text-white"
                  onClick={getTransactions}
                >
                  Refresh
                </button>
              </div>
              {user && (
                <ul className="flex flex-col gap-1">
                  {transactions.map((t) => {
                    const tDate = dayjs(t.timestamp);
                    return (
                      <li className="flex gap-1 items-center " key={t.id}>
                        <button
                          className="px-1 border rounded border-red-600 bg-red-600 text-white
                         disabled:invisible
                          "
                          onClick={() => deleteTransaction(t.id)}
                          disabled={!user || user.user_id != t.user_id}
                        >
                          X
                        </button>

                        <span>
                          {tDate.format("HH:mm")} - {displayDate(tDate)}
                        </span>
                        <span className="border border-slate-500 px-1">
                          {user?.user_id === t.user_id ? "You" : "Not you"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
        {appError && (
          <div className="flex border rouded border-red-500 text-red-500 p-2 gap-2">
            <button
              className="px-1 border rounded border-red-600 bg-red-600 text-white"
              onClick={() => setAppError(null)}
            >
              X
            </button>
            {appError}
          </div>
        )}
      </div>
    </div>
  );
}
