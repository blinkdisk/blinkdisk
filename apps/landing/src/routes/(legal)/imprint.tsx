import Legal from "@landing/components/legal";
import { head } from "@landing/utils/head";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(legal)/imprint")({
  component: RouteComponent,
  head: head({
    title: "Imprint",
    description: "The imprint of BlinkDisk.",
  }),
});

function RouteComponent() {
  return (
    <Legal>{`# Imprint

*Obligation to provide information according to §5 E-Commerce Law, §63 Trade Regulation Act, §14 Corporate Code, and disclosure obligation according to §25 Media Law.*

## Contact Information

Paul Köck \\
Wolf-Huber-Straße 31 \\
6800 Feldkirch \\
Austria

**Phone**: +43 670 6081524 \\
**E-Mail**: [paul@blinkdisk.com](mailto:paul@blinkdisk.com)

**Corporate Purpose**: Services in automated data processing and information technology

**Memberships**: Member of the Austrian Federal Economic Chamber (WKO) \\
**Professional Law**: Trade Regulation Act: www.ris.bka.gv.at

**Supervisory Authority**: Bezirkshauptmannschaft (BH) Feldkirch \\
**State of Grant**: Austria

## Accountability for content

The contents of our pages have been created with the utmost care. However, we cannot guarantee the contents' accuracy, completeness or topicality. According to statutory provisions, we are furthermore responsible for our own content on these web pages. In this matter, please note that we are not obliged to monitor the transmitted or saved information of third parties, or investigate circumstances pointing to illegal activity. Our obligations to remove or block the use of information under generally applicable laws remain unaffected by this as per §§ 8 to 10 of the Telemedia Act (TMG).

## Accountability for links

Responsibility for the content of external links (to web pages of third parties) lies solely with the operators of the linked pages. No violations were evident to us at the time of linking. Should any legal infringement become known to us, we will remove the respective link immediately.

## Copyright

Our web pages and their contents are subject to the Austria copyright law. Unless expressly permitted by law, every form of utilizing, reproducing or processing works subject to copyright protection on our web pages requires the prior consent of the respective owner of the rights. Individual reproductions of a work are only allowed for private use. The materials from these pages are copyrighted and any unauthorized use may violate copyright laws.
`}</Legal>
  );
}
