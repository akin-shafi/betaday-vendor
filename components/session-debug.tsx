"use client";

import {
  getSession,
  getSessionUser,
  isSessionValid,
  getSessionAge,
} from "@/lib/session";

export function SessionDebug() {
  const session = getSession();
  const user = getSessionUser();
  const isValid = isSessionValid();
  const age = getSessionAge();

  return (
    <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-xs font-mono">
      <h3 className="font-bold mb-2">Session Debug Info</h3>
      <div className="space-y-1">
        <p>
          <strong>Valid:</strong> {isValid ? "Yes" : "No"}
        </p>
        <p>
          <strong>Age:</strong> {Math.floor(age / 1000 / 60)} minutes
        </p>
        <p>
          <strong>User ID:</strong> {user?.id || "None"}
        </p>
        <p>
          <strong>Business Name:</strong> {user?.business?.name || "None"}
        </p>
        <p>
          <strong>Business Type:</strong>{" "}
          {user?.business?.businessType || "None"}
        </p>
        <p>
          <strong>Token:</strong> {session?.token ? "Present" : "Missing"}
        </p>
      </div>
    </div>
  );
}
