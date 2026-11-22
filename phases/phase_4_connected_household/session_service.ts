import { FamilyMember } from "./types";

export const SHARMA_HOUSEHOLD_MEMBERS: FamilyMember[] = [
  {
    email: "alex@family.com",
    name: "Alex",
    role: "admin",
    avatarColor: "indigo",
    householdName: "The Sharma Household"
  },
  {
    email: "mom@family.com",
    name: "Sarah (Mom)",
    role: "member",
    avatarColor: "purple",
    householdName: "The Sharma Household"
  },
  {
    email: "sam@family.com",
    name: "Sam (Kid)",
    role: "member",
    avatarColor: "pink",
    householdName: "The Sharma Household"
  }
];

export function resolveHouseholdMember(email: string): FamilyMember {
  const normalized = email.trim().toLowerCase();
  const existing = SHARMA_HOUSEHOLD_MEMBERS.find((m) => m.email === normalized);

  if (existing) {
    return existing;
  }

  // Auto-provision membership for custom email
  const namePart = normalized.split("@")[0];
  const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
  return {
    email: normalized,
    name: capitalized,
    role: "member",
    avatarColor: "emerald",
    householdName: "The Sharma Household"
  };
}

