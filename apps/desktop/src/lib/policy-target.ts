const DRAFT_POLICY_USER_PREFIX = "BLINKDISK-DRAFT-";

export type PolicyTarget =
  | { kind: "GLOBAL" }
  | { kind: "HOST"; hostName: string }
  | { kind: "USER"; hostName: string; userName: string }
  | { kind: "SOURCE"; hostName: string; userName: string; path: string }
  | {
      kind: "DRAFT_SOURCE";
      hostName: string;
      userName: string;
      path: string;
    };

type PolicyTargetKind = PolicyTarget["kind"];
export type DraftSourcePolicyTarget = Extract<
  PolicyTarget,
  { kind: "DRAFT_SOURCE" }
>;

export type PolicySearch = {
  kind?: PolicyTargetKind;
  hostName?: string;
  userName?: string;
  policyPath?: string;
};

export type LegacyPolicySearch = Omit<PolicySearch, "kind"> & {
  kind?: PolicyTargetKind | "FOLDER" | "DRAFT_FOLDER";
};

export type KopiaPolicyTarget = {
  host?: string;
  userName?: string;
  path?: string;
};

export type PolicyTreeSource = {
  id?: string;
  name?: string;
  emoji?: string;
  type?: "directory" | "file" | "symlink";
  source: {
    host: string;
    userName: string;
    path: string;
  };
};

export type PolicyTreePolicy = {
  target: KopiaPolicyTarget;
};

export type PolicyTreeNode = {
  id: string;
  label: string;
  target: PolicyTarget;
  source?: PolicyTreeSource;
  hasPolicy?: boolean;
  children: PolicyTreeNode[];
};

export function getDraftPolicyUserName(userName: string) {
  return `${DRAFT_POLICY_USER_PREFIX}${userName}`;
}

export function isDraftPolicyUserName(userName?: string | null) {
  return !!userName && userName.startsWith(DRAFT_POLICY_USER_PREFIX);
}

export function getRealPolicyUserName(userName: string) {
  return isDraftPolicyUserName(userName)
    ? userName.slice(DRAFT_POLICY_USER_PREFIX.length)
    : userName;
}

export function policyTargetId(target: PolicyTarget): string {
  switch (target.kind) {
    case "GLOBAL":
      return "GLOBAL";
    case "HOST":
      return `HOST:${target.hostName}`;
    case "USER":
      return `USER:${target.hostName}:${target.userName}`;
    case "SOURCE":
      return `SOURCE:${target.hostName}:${target.userName}:${target.path}`;
    case "DRAFT_SOURCE":
      return `DRAFT_SOURCE:${target.hostName}:${target.userName}:${target.path}`;
  }
}

export function policyTargetToSearch(target: PolicyTarget): PolicySearch {
  if (target.kind === "GLOBAL") return { kind: "GLOBAL" };

  return {
    kind: target.kind,
    hostName: target.hostName,
    ...("userName" in target ? { userName: target.userName } : {}),
    ...("path" in target ? { policyPath: target.path } : {}),
  };
}

export function policyTargetFromSearch(
  search: LegacyPolicySearch,
): PolicyTarget {
  switch (search.kind) {
    case "HOST":
      return search.hostName
        ? { kind: "HOST", hostName: search.hostName }
        : { kind: "GLOBAL" };
    case "USER":
      return search.hostName && search.userName
        ? {
            kind: "USER",
            hostName: search.hostName,
            userName: search.userName,
          }
        : { kind: "GLOBAL" };
    case "SOURCE":
    case "FOLDER":
      return search.hostName && search.userName && search.policyPath
        ? {
            kind: "SOURCE",
            hostName: search.hostName,
            userName: search.userName,
            path: search.policyPath,
          }
        : { kind: "GLOBAL" };
    case "DRAFT_SOURCE":
    case "DRAFT_FOLDER":
      return search.hostName && search.userName && search.policyPath
        ? {
            kind: "DRAFT_SOURCE",
            hostName: search.hostName,
            userName: search.userName,
            path: search.policyPath,
          }
        : { kind: "GLOBAL" };
    default:
      return { kind: "GLOBAL" };
  }
}

export function policyTargetToKopiaParams(
  target: PolicyTarget,
): Record<string, string> | undefined {
  switch (target.kind) {
    case "GLOBAL":
      return undefined;
    case "HOST":
      return { host: target.hostName };
    case "USER":
      return { host: target.hostName, userName: target.userName };
    case "SOURCE":
      return {
        host: target.hostName,
        userName: target.userName,
        path: target.path,
      };
    case "DRAFT_SOURCE":
      return {
        host: target.hostName,
        userName: getDraftPolicyUserName(target.userName),
        path: target.path,
      };
  }
}

export function policyTargetToResolveParams(
  target: PolicyTarget,
): Record<string, string> | undefined {
  if (target.kind === "DRAFT_SOURCE") {
    return {
      host: target.hostName,
      userName: target.userName,
      path: target.path,
    };
  }

  return policyTargetToKopiaParams(target);
}

export function policyTargetParent(target: PolicyTarget): PolicyTarget | null {
  switch (target.kind) {
    case "GLOBAL":
      return null;
    case "HOST":
      return { kind: "GLOBAL" };
    case "USER":
      return { kind: "HOST", hostName: target.hostName };
    case "SOURCE":
    case "DRAFT_SOURCE":
      return {
        kind: "USER",
        hostName: target.hostName,
        userName: target.userName,
      };
  }
}

function policyTargetLabel(target: PolicyTarget) {
  switch (target.kind) {
    case "GLOBAL":
      return "Vault";
    case "HOST":
      return target.hostName;
    case "USER":
      return target.userName;
    case "SOURCE":
    case "DRAFT_SOURCE":
      return basename(target.path);
  }
}

export function isPolicyTargetEqual(a: PolicyTarget, b: PolicyTarget) {
  return policyTargetId(a) === policyTargetId(b);
}

export function createDraftPolicyTarget({
  hostName,
  userName,
  path,
}: {
  hostName: string;
  userName: string;
  path: string;
}): DraftSourcePolicyTarget {
  return {
    kind: "DRAFT_SOURCE",
    hostName,
    userName,
    path,
  };
}

export function parseKopiaPolicyTarget(
  target: KopiaPolicyTarget,
): PolicyTarget {
  if (!target.host) return { kind: "GLOBAL" };
  if (!target.userName) return { kind: "HOST", hostName: target.host };

  const userName = getRealPolicyUserName(target.userName);

  if (!target.path) {
    return {
      kind: "USER",
      hostName: target.host,
      userName,
    };
  }

  return {
    kind: isDraftPolicyUserName(target.userName) ? "DRAFT_SOURCE" : "SOURCE",
    hostName: target.host,
    userName,
    path: target.path,
  };
}

export function buildPolicyTree({
  policies,
  sources,
}: {
  policies: PolicyTreePolicy[];
  sources: PolicyTreeSource[];
}): PolicyTreeNode {
  const root: PolicyTreeNode = {
    id: "GLOBAL",
    label: "Vault",
    target: { kind: "GLOBAL" },
    children: [],
  };

  const hosts = new Map<string, PolicyTreeNode>();
  const users = new Map<string, PolicyTreeNode>();
  const sourcesByUser = new Map<string, Map<string, PolicyTreeNode>>();

  function ensureHost(hostName: string) {
    const existing = hosts.get(hostName);
    if (existing) return existing;

    const node: PolicyTreeNode = {
      id: policyTargetId({ kind: "HOST", hostName }),
      label: hostName,
      target: { kind: "HOST", hostName },
      children: [],
    };
    hosts.set(hostName, node);
    root.children.push(node);
    return node;
  }

  function ensureUser(hostName: string, userName: string) {
    const id = policyTargetId({ kind: "USER", hostName, userName });
    const existing = users.get(id);
    if (existing) return existing;

    const host = ensureHost(hostName);
    const node: PolicyTreeNode = {
      id,
      label: userName,
      target: { kind: "USER", hostName, userName },
      children: [],
    };
    users.set(id, node);
    host.children.push(node);
    return node;
  }

  function ensureSource(
    target: Extract<PolicyTarget, { kind: "SOURCE" | "DRAFT_SOURCE" }>,
  ) {
    ensureUser(target.hostName, target.userName);
    const userId = policyTargetId({
      kind: "USER",
      hostName: target.hostName,
      userName: target.userName,
    });
    let sources = sourcesByUser.get(userId);
    if (!sources) {
      sources = new Map();
      sourcesByUser.set(userId, sources);
    }

    const id = policyTargetId(target);
    const existing = sources.get(id);
    if (existing) return existing;

    const node: PolicyTreeNode = {
      id,
      label: policyTargetLabel(target),
      target,
      children: [],
    };
    sources.set(id, node);
    return node;
  }

  for (const source of sources) {
    const userName = getRealPolicyUserName(source.source.userName);
    const node = ensureSource({
      kind: isDraftPolicyUserName(source.source.userName)
        ? "DRAFT_SOURCE"
        : "SOURCE",
      hostName: source.source.host,
      userName,
      path: source.source.path,
    });
    node.source = {
      ...source,
      source: {
        ...source.source,
        userName,
      },
    };
    node.label = source.name || node.label;
  }

  for (const policy of policies) {
    const target = parseKopiaPolicyTarget(policy.target);

    switch (target.kind) {
      case "GLOBAL":
        root.hasPolicy = true;
        break;
      case "HOST":
        ensureHost(target.hostName).hasPolicy = true;
        break;
      case "USER":
        ensureUser(target.hostName, target.userName).hasPolicy = true;
        break;
      case "SOURCE":
      case "DRAFT_SOURCE":
        ensureSource(target).hasPolicy = true;
        break;
    }
  }

  for (const [userId, sources] of sourcesByUser) {
    const userNode = users.get(userId);
    if (!userNode) continue;

    const nodes = Array.from(sources.values()).sort((a, b) => {
      const pathCompare =
        getPathDepth(getNodePath(a)) - getPathDepth(getNodePath(b));
      if (pathCompare !== 0) return pathCompare;
      return getNodePath(a).localeCompare(getNodePath(b));
    });

    for (const node of nodes) {
      let parent: PolicyTreeNode | undefined;
      let parentDepth = -1;

      for (const candidate of nodes) {
        if (candidate.id === node.id) continue;
        if (!isChildPath(getNodePath(candidate), getNodePath(node))) continue;

        const depth = getPathDepth(getNodePath(candidate));
        if (depth <= parentDepth) continue;

        parent = candidate;
        parentDepth = depth;
      }

      if (parent) parent.children.push(node);
      else userNode.children.push(node);
    }
  }

  sortTree(root);
  return root;
}

function getNodePath(node: PolicyTreeNode) {
  return "path" in node.target ? node.target.path : "";
}

function basename(path: string) {
  const normalized = path.replace(/[\\/]+$/, "");
  const parts = normalized.split(/[\\/]/).filter(Boolean);
  return parts.at(-1) || path;
}

function getPathDepth(path: string) {
  return path.split(/[\\/]/).filter(Boolean).length;
}

function isChildPath(parent: string, child: string) {
  if (parent === child) return false;

  const normalizedParent = parent.replace(/[\\/]+$/, "");
  const normalizedChild = child.replace(/[\\/]+$/, "");

  return (
    normalizedChild.startsWith(`${normalizedParent}/`) ||
    normalizedChild.startsWith(`${normalizedParent}\\`)
  );
}

function sortTree(node: PolicyTreeNode) {
  node.children.sort((a, b) => {
    if (a.target.kind === "DRAFT_SOURCE" && b.target.kind !== "DRAFT_SOURCE")
      return -1;
    if (b.target.kind === "DRAFT_SOURCE" && a.target.kind !== "DRAFT_SOURCE")
      return 1;
    return a.label.localeCompare(b.label);
  });

  for (const child of node.children) sortTree(child);
}
