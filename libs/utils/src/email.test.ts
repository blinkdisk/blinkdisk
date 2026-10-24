import { createServer, type Server, type Socket } from "node:net";
import nodemailer from "nodemailer";

describe("SMTP email delivery", () => {
  let server: Server;
  let smtpUrl: string;
  let commands: string[];
  let messages: string[];
  let sockets: Set<Socket>;

  beforeEach(async () => {
    commands = [];
    messages = [];
    sockets = new Set();

    server = createServer((socket) => {
      sockets.add(socket);
      socket.on("close", () => sockets.delete(socket));
      socket.setEncoding("utf8");
      socket.write("220 localhost ESMTP\r\n");

      let pending = "";
      let body: string[] | undefined;

      socket.on("data", (chunk) => {
        pending += chunk;
        let lineEnd = pending.indexOf("\r\n");

        while (lineEnd !== -1) {
          const line = pending.slice(0, lineEnd);
          pending = pending.slice(lineEnd + 2);

          if (body) {
            if (line === ".") {
              messages.push(body.join("\r\n"));
              body = undefined;
              socket.write("250 Message accepted\r\n");
            } else {
              body.push(line.replace(/^\.\./, "."));
            }
          } else {
            commands.push(line);

            if (line.startsWith("EHLO ")) {
              socket.write(
                "250-localhost\r\n250-PIPELINING\r\n250 AUTH PLAIN\r\n",
              );
            } else if (line.startsWith("AUTH PLAIN ")) {
              socket.write("235 Authentication successful\r\n");
            } else if (line === "DATA") {
              body = [];
              socket.write("354 End with a dot\r\n");
            } else if (line === "QUIT") {
              socket.end("221 Goodbye\r\n");
            } else {
              socket.write("250 OK\r\n");
            }
          }

          lineEnd = pending.indexOf("\r\n");
        }
      });
    });

    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", () => {
        server.off("error", reject);
        resolve();
      });
    });

    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("SMTP test server did not bind a TCP port");
    }

    smtpUrl = `smtp://blinkdisk:test%3Apassword@127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    for (const socket of sockets) socket.destroy();
    if (!server.listening) return;
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it("sends UTF-8 HTML and quoted recipients using an SMTP URL", async () => {
    const smtp = nodemailer.createTransport(smtpUrl);
    const html = "<p>Grüße von BlinkDisk – your backup is ready.</p>";

    const result = await smtp.sendMail({
      from: "BlinkDisk <auth@blinkdisk.com>",
      to: '"Koeck, Paul" <paul@example.com>',
      subject: "Grüße von BlinkDisk",
      html,
    });

    expect(result.accepted).toEqual(["paul@example.com"]);
    const authentication = commands.find((command) =>
      command.startsWith("AUTH PLAIN "),
    );
    expect(
      Buffer.from(authentication?.slice(11) ?? "", "base64").toString(),
    ).toBe("\0blinkdisk\0test:password");
    expect(commands).toContain("MAIL FROM:<auth@blinkdisk.com>");
    expect(commands).toContain("RCPT TO:<paul@example.com>");
    expect(messages).toHaveLength(1);
    const message = messages[0] ?? "";
    expect(message).toContain('To: "Koeck, Paul" <paul@example.com>');
    expect(message).toMatch(/^Subject: =\?UTF-8\?[BQ]\?/im);
    expect(message).toMatch(/^Content-Type: text\/html; charset=utf-8$/im);
    expect(message).toMatch(/^Content-Transfer-Encoding: quoted-printable$/im);

    const body = message.slice(message.indexOf("\r\n\r\n") + 4);
    const decodedBody = Buffer.from(
      body
        .replace(/=\r\n/g, "")
        .replace(/=([\da-f]{2})/gi, (_, hex: string) =>
          String.fromCharCode(Number.parseInt(hex, 16)),
        ),
      "latin1",
    ).toString("utf8");
    expect(decodedBody.trimEnd()).toBe(html);
  });

  it("keeps a CRLF subject from adding a header or envelope recipient", async () => {
    const smtp = nodemailer.createTransport(smtpUrl);

    await smtp.sendMail({
      from: "BlinkDisk <auth@blinkdisk.com>",
      to: "paul@example.com",
      subject: "Backup complete\r\nBcc: attacker@example.com",
      html: "<p>Your backup is ready.</p>",
    });

    expect(
      commands.filter((command) => command.startsWith("RCPT TO:")),
    ).toEqual(["RCPT TO:<paul@example.com>"]);
    expect(messages).toHaveLength(1);
    expect(messages[0]).not.toMatch(/^Bcc:/im);
  });

  it("normalizes international recipient domains before SMTP delivery", async () => {
    const smtp = nodemailer.createTransport(smtpUrl);

    const result = await smtp.sendMail({
      from: "BlinkDisk <auth@blinkdisk.com>",
      to: "paul@exa\u00admple.com",
      subject: "Your backup",
      html: "<p>Your backup is ready.</p>",
    });

    expect(result.accepted).toEqual(["paul@example.com"]);
    expect(commands).toContain("RCPT TO:<paul@example.com>");
    expect(messages[0]).toMatch(/^To: paul@example\.com$/im);
  });

  it.each([
    {
      address: "Victim (x(y) <evil@evil.com>) <v@victim.com>",
      recipientDomain: "victim.com",
    },
    {
      address: "G: (a; <evil@evil.com>) <v@victim.com>;",
      recipientDomain: "victim.com",
    },
    {
      address: '<"a@evil.com>"@good.com>',
      recipientDomain: "good.com",
    },
  ])("keeps $address on its intended recipient domain", async ({
    address,
    recipientDomain,
  }) => {
    const smtp = nodemailer.createTransport(smtpUrl);

    const result = await smtp.sendMail({
      from: "BlinkDisk <auth@blinkdisk.com>",
      to: address,
      subject: "Your backup",
      html: "<p>Your backup is ready.</p>",
    });

    expect(
      result.accepted.map((recipient) =>
        recipient.slice(recipient.lastIndexOf("@") + 1),
      ),
    ).toEqual([recipientDomain]);
    expect(
      commands.filter((command) => command.startsWith("RCPT TO:")),
    ).toEqual([`RCPT TO:<${result.accepted[0]}>`]);
  });
});
