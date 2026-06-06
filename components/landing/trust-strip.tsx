import { ClipboardList, Lock, Scale, Shield } from "lucide-react"

const ITEMS = [
  {
    icon: Shield,
    title: "Your data is protected",
    description:
      "We use advanced encryption and security practices to keep your data safe.",
  },
  {
    icon: Scale,
    title: "100% Statutory Compliant",
    description:
      "Our processes comply with Public Service Superannuation Fund regulations.",
  },
  {
    icon: ClipboardList,
    title: "Full Audit Trail",
    description:
      "Every action is logged for transparency and accountability.",
  },
  {
    icon: Lock,
    title: "Secure Document Storage",
    description:
      "Your documents are stored securely and accessible only to authorized users.",
  },
]

export function TrustStrip() {
  return (
    <section id="about" className="bg-[#F5F5F5] dark:bg-gray-800 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {ITEMS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="text-center sm:text-left">
              <Icon className="size-8 text-[#1A7A4A] mx-auto sm:mx-0 mb-3" aria-hidden />
              <h3 className="text-sm font-bold text-[#0D2137] dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-[#6B7280] dark:text-gray-400 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
