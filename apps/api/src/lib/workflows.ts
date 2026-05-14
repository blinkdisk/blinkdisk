type CancellationWorkflowParams = {
  subscriptionId: string;
  cleanupAt: string;
};

type TrialWorkflowParams = {
  trialId: string;
  endsAt: string;
};

function isDuplicateWorkflowError(error: unknown) {
  return (
    error instanceof Error && error.message.toLowerCase().includes("already")
  );
}

export async function startTrialWorkflow(
  env: CloudflareBindings,
  params: TrialWorkflowParams,
) {
  const endsAt = new Date(params.endsAt);

  try {
    await env.TRIAL_WORKFLOW.create({
      id: `trial-${params.trialId}-${endsAt.getTime()}`,
      params,
    });
  } catch (error) {
    if (isDuplicateWorkflowError(error)) return;

    throw error;
  }
}

export async function startCancellationWorkflow(
  env: CloudflareBindings,
  params: CancellationWorkflowParams,
) {
  const cleanupAt = new Date(params.cleanupAt);

  try {
    await env.CANCELLATION_WORKFLOW.create({
      id: `cancellation-${params.subscriptionId}-${cleanupAt.getTime()}`,
      params,
    });
  } catch (error) {
    if (isDuplicateWorkflowError(error)) return;

    throw error;
  }
}
