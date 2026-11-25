// Mutations report their own failures in onError. TanStack Form's handleSubmit
// rethrows onSubmit errors and the forms don't await it, so passing the
// rejection on would only add an unhandled rejection.
export async function settleMutation(mutation: Promise<unknown>) {
  await mutation.catch(() => undefined);
}
