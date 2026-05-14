type CancellationWorkflowParams = {
  subscriptionId: string;
  cleanupAt: string;
  canceledAt: string;
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

function cancellationWorkflowId(params: CancellationWorkflowParams) {
  return `${params.subscriptionId}-${new Date(params.canceledAt).getTime()}`;
}

export async function startTrialWorkflow(
  env: CloudflareBindings,
  params: TrialWorkflowParams,
) {
  try {
    await env.TRIAL_WORKFLOW.create({
      id: params.trialId,
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
    const instance = await env.TRIAL_WORKFLOW.get(params.trialId);
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
      id: cancellationWorkflowId(params),
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
      cancellationWorkflowId(params),
    );
    const { status } = await instance.status();

    if (["complete", "errored", "terminated"].includes(status)) return;

    await instance.terminate();
  } catch (error) {
    if (isMissingWorkflowError(error)) return;

    throw error;
  }
}
