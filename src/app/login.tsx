import { SupabaseClient } from "@supabase/supabase-js";
import * as React from "react";
import { useState, useEffect } from "react";

type LoginProps = {
  supabaseClient: SupabaseClient;
};

function Login({ supabaseClient }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { error } = await supabaseClient.auth.signInWithPassword({
      password,
      email,
    });
    if (error) setError(error.message);
  };

  return (
    <div className="p-2 border border-slate-400 flex gap-1 flex-col items-center justify-center w-full">
      <form
        id="login_form"
        onSubmit={handleSubmit}
        autoComplete="on"
        className="flex gap-2 flex-col items-center justify-center w-full"
      >
        <label className="text-sm" htmlFor="login_email">
          Email
        </label>
        <input
          className="border border-slate-400 p-1 rounded"
          type="email"
          id="login_email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        ></input>
        <label className="text-sm" htmlFor="login_password">
          Password
        </label>
        <input
          className="border border-slate-400  p-1 rounded"
          type="password"
          id="login_password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        ></input>
        <button
          className="border rounded border-green-500 p-1 bg-green-500 text-white mt-1"
          type="submit"
        >
          Sign In
        </button>
      </form>
      <p className="text-red-700">{error}</p>
    </div>
  );
}

export default Login;
