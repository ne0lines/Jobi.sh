"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/app/types";
import { useTranslations } from "next-intl";

type Props = {
  profile: UserProfile;
};

const fields = [
  { key: "name", label: "nameLabel", type: "text" },
  { key: "email", label: "emailLabel", type: "email" },
  { key: "profession", label: "professionLabel", type: "text" },
] as const;

async function updateUserProfile(
  updates: Partial<UserProfile>,
): Promise<UserProfile> {
  const res = await fetch("/api/user", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    throw new Error("Failed to update profile");
  }

  return res.json();
}

export default function ProfileInfo({ profile }: Props) {
  const t = useTranslations("account");

  const [profileInfo, setProfileInfo] = useState(profile);
  const [draftProfile, setDraftProfile] = useState(profile);
  const [isEditing, setIsEditing] = useState(false);

  const isChanged =
    draftProfile.name !== profileInfo.name ||
    draftProfile.email !== profileInfo.email ||
    draftProfile.profession !== profileInfo.profession;

  const startEditing = () => {
    setDraftProfile(profileInfo);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraftProfile(profileInfo);
    setIsEditing(false);
  };

  const handleSave = async () => {
    const updatedProfile = await updateUserProfile(draftProfile);

    setProfileInfo(updatedProfile);
    setDraftProfile(updatedProfile);
    setIsEditing(false);
  };

  return (
    <section className='rounded-3xl border border-app-stroke bg-app-card p-5'>
      <dl className='space-y-3 text-base text-app-ink'>
        <div className='flex flex-row justify-between'>
          {isEditing ? (
            <div className='w-full'>
              {fields.map((field) => (
                <div key={field.key}>
                  <dt className='text-sm font-semibold mt-2 uppercase tracking-[0.08em] text-app-muted'>
                    {t(field.label)}
                  </dt>

                  <input
                    className='w-full px-2 py-1 rounded border border-blue-500 bg-white text-black outline-none focus:ring-2 focus:ring-blue-400'
                    type={field.type}
                    value={draftProfile[field.key]}
                    onChange={(e) =>
                      setDraftProfile({
                        ...draftProfile,
                        [field.key]: e.target.value,
                      })
                    }
                  />
                </div>
              ))}

              <div className='flex justify-end mt-4'>
                <Button onClick={cancelEditing}>Avbryt</Button>
                <Button
                  className='ml-2'
                  onClick={handleSave}
                  disabled={!isChanged}
                >
                  Spara
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {fields.map((field) => (
                <div key={field.key}>
                  <dt className='text-sm font-semibold mt-2 uppercase tracking-[0.08em] text-app-muted'>
                    {t(field.label)}
                  </dt>
                  <dd>{profileInfo[field.key]}</dd>
                </div>
              ))}
            </div>
          )}

          {!isEditing && <Button onClick={startEditing}>Ändra</Button>}
        </div>
      </dl>
    </section>
  );
}
