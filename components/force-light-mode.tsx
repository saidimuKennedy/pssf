"use client"

import { useEffect } from "react"

export function ForceLightMode() {
  useEffect(() => {
    document.documentElement.classList.remove("dark")
    localStorage.setItem("pssf-theme", "light")
  }, [])

  return null
}
