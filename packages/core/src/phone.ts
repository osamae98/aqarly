import { getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js";

// The sign-in screens' country picker. Server-side only: a page builds the
// options and hands them to its (client) form as plain data, so the phone
// library never reaches the browser, and a server action turns the picked
// country and the typed number back into one phone for the API.

// Where the picker starts. People can still choose any other country.
export const defaultCountry = "SA";

// The seed's made-up numbers (+000 000 0001…) aren't in any country. Offered
// last, so the demo accounts can still sign in wherever the seed was loaded.
const DEMO = "DEMO";
const DEMO_CODE = "000";

export interface CountryOption {
  value: string;
  // Its calling code, without the "+", for the picker's closed state.
  code: string;
  label: string;
}

export function countryOptions(): CountryOption[] {
  const names = new Intl.DisplayNames(["en"], { type: "region" });
  return [
    ...getCountries()
      .map((country) => ({
        value: country,
        code: getCountryCallingCode(country),
        label: `${names.of(country) ?? country} (+${getCountryCallingCode(country)})`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    { value: DEMO, code: DEMO_CODE, label: `Demo accounts (+${DEMO_CODE})` },
  ];
}

// "SA" + "050 123 4567" → "+966 501234567". The leading 0 people type at home
// (the trunk prefix) isn't dialled from abroad, so it goes. The API compares
// digits only, so spacing doesn't matter.
export function phoneFrom(country: string, typed: string): string {
  const digits = typed.replace(/\D/g, "");
  if (!digits) throw new Error("Enter your mobile number");
  if (country === DEMO) return `+${DEMO_CODE} ${digits}`;
  if (!(getCountries() as string[]).includes(country)) throw new Error("Choose your country");
  return `+${getCountryCallingCode(country as CountryCode)} ${digits.replace(/^0+/, "")}`;
}
