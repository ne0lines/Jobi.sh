import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get("locale")?.value ?? "sv";
  const locale = ["sv", "en", "uk", "ar"].includes(rawLocale) ? rawLocale : "sv";

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
