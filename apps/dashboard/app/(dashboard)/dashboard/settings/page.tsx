import {
  ChangeEmailCard,
  ChangePasswordCard,
  DeleteAccountCard,
  ProvidersCard,
  SessionsCard,
  UpdateAvatarCard,
  UpdateNameCard,
  UpdateUsernameCard,
} from '@daveyplate/better-auth-ui';

import { RedirectToSignIn, SignedIn } from '@daveyplate/better-auth-ui';

export default function UserSettingsPage() {
  return (
    <>
      <RedirectToSignIn />
      <SignedIn>
        <div className="container mx-auto flex flex-col gap-6 px-4 py-12">
          <UpdateAvatarCard />

          <UpdateNameCard />

          <UpdateUsernameCard />

          <ChangeEmailCard />

          <ChangePasswordCard />

          <ProvidersCard />

          <SessionsCard />

          <DeleteAccountCard />

          {/* <UpdateFieldCard
            field="age"
            label="Age"
            description="Update your age"
            placeholder="Enter your current age"
            type="number"
          /> */}
        </div>
      </SignedIn>
    </>
  );
}
