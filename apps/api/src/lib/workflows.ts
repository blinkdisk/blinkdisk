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

function isMissingWorkflowError(error: unknown) {
  return (
    error instanceof Error &&
    ["doesn't exist", "does not exist", "not found"].some((message) =>
      error.message.toLowerCase().includes(message),
    )
  );
}

function getCancellationWorkflowId(params: CancellationWorkflowParams) {
  const cleanupAt = new Date(params.cleanupAt);
  return `cancellation-${params.subscriptionId}-${cleanupAt.getTime()}`;
}

function getTrialWorkflowId(params: TrialWorkflowParams) {
  const endsAt = new Date(params.endsAt);
  return `trial-${params.trialId}-${endsAt.getTime()}`;
}

export async function startTrialWorkflow(
  env: CloudflareBindings,
  params: TrialWorkflowParams,
) {
  try {
    await env.TRIAL_WORKFLOW.create({
      id: getTrialWorkflowId(params),
      params,
    });
  } catch (error) {
    if (isDuplicateWorkflowError(error)) return;

    throw error;
  }
}

export async function stopTrialWorkflow(
  env: CloudflareBindings,
  params: TrialWorkflowParams,
) {
  try {
    const instance = await env.TRIAL_WORKFLOW.get(getTrialWorkflowId(params));
    const { status } = await instance.status();

    if (["complete", "errored", "terminated"].includes(status)) return;

    await instance.terminate();
  } catch (error) {
    if (isMissingWorkflowError(error)) return;

    throw error;
  }
}

export async function startCancellationWorkflow(
  env: CloudflareBindings,
  params: CancellationWorkflowParams,
) {
  try {
    await env.CANCELLATION_WORKFLOW.create({
      id: getCancellationWorkflowId(params),
      params,
    });
  } catch (error) {
    if (isDuplicateWorkflowError(error)) return;

    throw error;
  }
}

export async function stopCancellationWorkflow(
  env: CloudflareBindings,
  params: CancellationWorkflowParams,
) {
  try {
    const instance = await env.CANCELLATION_WORKFLOW.get(
      getCancellationWorkflowId(params),
    );
    const { status } = await instance.status();

    if (["complete", "errored", "terminated"].includes(status)) return;

    await instance.terminate();
  } catch (error) {
    if (isMissingWorkflowError(error)) return;

    throw error;
  }
}
