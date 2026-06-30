import { cn } from "@blinkdisk/utils/class";

type VaultIconProps = {
  className?: string;
};

const VAULT_BASE_SVG = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={1000}
    height={1000}
    viewBox="0 0 1000 1000"
    fill="none"
    className="h-full w-full"
  >
    <title>Vault</title>
    <rect
      width={1000}
      height={1000}
      rx={200}
      fill="url(#paint0_linear_248_72)"
    />
    <g filter="url(#filter0_d_248_72)">
      <rect
        x={68.54}
        y={69.27}
        width={861.46}
        height={861.46}
        rx={172.29}
        fill="url(#paint1_linear_248_72)"
      />
      <rect
        x={61.36}
        y={62.09}
        width={875.81}
        height={875.81}
        rx={179.47}
        stroke="#3C3FD2"
        strokeWidth={14.36}
      />
    </g>
    <rect
      opacity={0.1}
      x={68.54}
      y={485.64}
      width={861.46}
      height={11.49}
      fill="black"
    />
    <rect
      opacity={0.3}
      x={68.54}
      y={497.13}
      width={861.46}
      height={11.49}
      fill="white"
    />
    <circle
      cx={499.74}
      cy={500.15}
      r={279.67}
      fill="#A6A7FF"
      stroke="url(#paint2_linear_248_72)"
      strokeWidth={11.07}
    />
    <circle
      cx={499.23}
      cy={499.64}
      r={251.5}
      fill="url(#paint3_linear_248_72)"
    />
    <ellipse
      cx={499.47}
      cy={499.64}
      rx={191.81}
      ry={192.34}
      fill="url(#paint4_linear_248_72)"
    />
    <path
      d="M496.61 703.85C497.56 703.86 498.51 703.87 499.47 703.87V730.87L497.99 730.86C497.4 730.86 496.82 730.85 496.23 730.85L496.61 703.85ZM502.71 730.85C501.63 730.86 500.55 730.87 499.47 730.87V703.87C500.43 703.87 501.38 703.86 502.34 703.85L502.71 730.85ZM451.53 698.16C453.37 698.6 455.22 699.02 457.08 699.42L451.44 725.83C449.34 725.38 447.24 724.9 445.15 724.39L451.53 698.16ZM553.79 724.39C551.7 724.9 549.61 725.38 547.5 725.83L544.68 712.62L541.87 699.42C543.73 699.02 545.57 698.6 547.41 698.16L553.79 724.39ZM602.12 706.65C600.2 707.61 598.26 708.55 596.31 709.46L584.9 685C586.62 684.19 588.32 683.37 590.01 682.52L602.12 706.65ZM408.93 682.52C410.62 683.37 412.33 684.19 414.05 685L402.63 709.46C400.68 708.55 398.74 707.61 396.82 706.65L408.93 682.52ZM370.86 657.71C372.32 658.92 373.81 660.11 375.3 661.27L358.72 682.58C357.02 681.26 355.34 679.91 353.68 678.55L370.86 657.71ZM645.26 678.55C643.6 679.91 641.92 681.26 640.23 682.58L631.93 671.93L623.64 661.27C625.14 660.11 626.62 658.92 628.09 657.71L645.26 678.55ZM339.21 625.06C340.37 626.56 341.55 628.04 342.75 629.51L332.31 638.07L332.31 638.07L321.86 646.62C320.5 644.96 319.16 643.27 317.85 641.57L339.21 625.06ZM681.1 641.57C679.78 643.27 678.44 644.96 677.08 646.62L666.63 638.07L656.19 629.51C657.39 628.04 658.58 626.56 659.74 625.06L681.1 641.57ZM315.59 586.22C316.39 587.95 317.21 589.65 318.06 591.35L293.89 603.39C292.94 601.47 292 599.53 291.1 597.58L315.59 586.22ZM707.85 597.58C706.94 599.53 706.01 601.47 705.05 603.39L692.97 597.37L680.88 591.35C681.73 589.65 682.55 587.95 683.35 586.22L707.85 597.58ZM301.25 543.13C301.64 544.99 302.06 546.84 302.5 548.68L276.26 555.02C275.75 552.93 275.28 550.83 274.83 548.73L301.25 543.13ZM724.11 548.73C723.66 550.83 723.19 552.93 722.68 555.02L696.44 548.68C696.88 546.84 697.3 544.99 697.7 543.13L724.11 548.73ZM269.82 500.69C269.82 499.7 269.83 498.71 269.84 497.72L269.85 497.46L296.84 497.83C296.83 498.78 296.82 499.74 296.82 500.69C296.82 501.65 296.83 502.61 296.84 503.56L269.85 503.93C269.83 502.86 269.82 501.78 269.82 500.69ZM729.12 500.69C729.12 501.78 729.11 502.86 729.1 503.93L702.1 503.56C702.11 502.61 702.12 501.65 702.12 500.69C702.12 499.74 702.11 498.78 702.1 497.83L729.1 497.46C729.11 498.54 729.12 499.61 729.12 500.69ZM276.26 446.37L302.5 452.71C302.06 454.55 301.64 456.4 301.25 458.26L288.04 455.46L274.83 452.66C275.21 450.88 275.61 449.1 276.03 447.32L276.26 446.37ZM722.68 446.37C723.19 448.46 723.66 450.56 724.11 452.66L710.9 455.46L710.9 455.46L697.7 458.26C697.3 456.4 696.88 454.55 696.44 452.71L722.68 446.37ZM318.06 410.04C317.21 411.74 316.39 413.45 315.59 415.17L291.1 403.81C292 401.86 292.94 399.92 293.89 398L318.06 410.04ZM705.05 398C706.01 399.92 706.94 401.86 707.85 403.81L683.35 415.17C682.55 413.45 681.73 411.74 680.88 410.04L705.05 398ZM342.75 371.88C341.55 373.35 340.37 374.83 339.21 376.33L317.85 359.82C319.16 358.12 320.5 356.44 321.86 354.77L342.75 371.88ZM677.08 354.77C678.44 356.44 679.78 358.12 681.1 359.82L659.74 376.33C658.58 374.83 657.39 373.35 656.19 371.88L677.08 354.77ZM358.72 318.81L375.3 340.12C373.81 341.28 372.32 342.47 370.86 343.68L353.68 322.85C355.01 321.75 356.34 320.68 357.69 319.62L358.72 318.81ZM640.23 318.81C641.92 320.13 643.6 321.48 645.26 322.85L628.09 343.68C626.62 342.47 625.14 341.28 623.64 340.12L640.23 318.81ZM414.05 316.4C412.33 317.2 410.62 318.02 408.93 318.87L396.82 294.74C398.74 293.78 400.68 292.84 402.63 291.93L414.05 316.4ZM596.32 291.93C598.27 292.84 600.2 293.78 602.12 294.74L590.01 318.87C588.32 318.02 586.62 317.2 584.9 316.4L596.32 291.93ZM457.08 301.97C455.22 302.37 453.37 302.79 451.53 303.23L445.15 277C447.24 276.49 449.34 276.01 451.44 275.56L457.08 301.97ZM547.5 275.56C549.61 276.01 551.7 276.49 553.79 277L547.41 303.23C545.57 302.79 543.73 302.37 541.87 301.97L547.5 275.56ZM499.47 270.52C500.55 270.52 501.63 270.53 502.71 270.55L502.52 284.04L502.52 284.04L502.34 297.54C501.38 297.53 500.43 297.52 499.47 297.52C498.51 297.52 497.56 297.53 496.61 297.54L496.23 270.55C497.31 270.53 498.39 270.52 499.47 270.52Z"
      fill="white"
    />
    <g filter="url(#filter1_d_248_72)">
      <ellipse
        cx={500}
        cy={499.5}
        rx={130}
        ry={130.5}
        fill="url(#paint5_linear_248_72)"
        shapeRendering="crispEdges"
      />
      <path
        d="M500 364.42C574.34 364.42 634.58 424.92 634.58 499.5C634.58 574.08 574.34 634.58 500 634.58C425.66 634.58 365.42 574.08 365.42 499.5C365.42 424.92 425.66 364.42 500 364.42Z"
        stroke="white"
        strokeOpacity={0.35}
        strokeWidth={9.15}
        shapeRendering="crispEdges"
      />
    </g>
    <path
      d="M69 265H90C112.64 265 131 283.36 131 306V405C131 427.64 112.64 446 90 446H69V265Z"
      fill="url(#paint6_linear_248_72)"
    />
    <mask
      id="path-13-outside-1_248_72"
      maskUnits="userSpaceOnUse"
      x={69}
      y={291}
      width={45}
      height={129}
      fill="black"
    >
      <rect fill="white" x={69} y={291} width={45} height={129} />
      <path d="M69 296H89C100.05 296 109 304.95 109 316V395C109 406.05 100.05 415 89 415H69V296Z" />
    </mask>
    <path
      d="M69 296H89C100.05 296 109 304.95 109 316V395C109 406.05 100.05 415 89 415H69V296Z"
      fill="url(#paint7_linear_248_72)"
    />
    <path
      d="M69 291H89C102.81 291 114 302.19 114 316H104C104 307.72 97.28 301 89 301H69V291ZM114 395C114 408.81 102.81 420 89 420H69V410H89C97.28 410 104 403.28 104 395H114ZM104 395M69 415V296V415M89 291C102.81 291 114 302.19 114 316V395C114 408.81 102.81 420 89 420V410C97.28 410 104 403.28 104 395V316C104 307.72 97.28 301 89 301V291Z"
      fill="#999ACA"
      mask="url(#path-13-outside-1_248_72)"
    />
    <path
      d="M824 385C824 365.67 839.67 350 859 350V350C878.33 350 894 365.67 894 385L894 582C894 601.33 878.33 617 859 617V617C839.67 617 824 601.33 824 582L824 385Z"
      fill="url(#paint8_linear_248_72)"
    />
    <rect
      x={878.5}
      y={600.5}
      width={39}
      height={234}
      rx={19.5}
      transform="rotate(-180 878.5 600.5)"
      fill="url(#paint9_linear_248_72)"
      stroke="#9B9CC8"
      strokeWidth={5}
    />
    <path
      d="M69 548H90C112.64 548 131 566.36 131 589V688C131 710.64 112.64 729 90 729H69V548Z"
      fill="url(#paint10_linear_248_72)"
    />
    <mask
      id="path-18-outside-2_248_72"
      maskUnits="userSpaceOnUse"
      x={69}
      y={574}
      width={45}
      height={129}
      fill="black"
    >
      <rect fill="white" x={69} y={574} width={45} height={129} />
      <path d="M69 579H89C100.05 579 109 587.95 109 599V678C109 689.05 100.05 698 89 698H69V579Z" />
    </mask>
    <path
      d="M69 579H89C100.05 579 109 587.95 109 599V678C109 689.05 100.05 698 89 698H69V579Z"
      fill="url(#paint11_linear_248_72)"
    />
    <path
      d="M69 574H89C102.81 574 114 585.19 114 599H104C104 590.72 97.28 584 89 584H69V574ZM114 678C114 691.81 102.81 703 89 703H69V693H89C97.28 693 104 686.28 104 678H114ZM104 678M69 698V579V698M89 574C102.81 574 114 585.19 114 599V678C114 691.81 102.81 703 89 703V693C97.28 693 104 686.28 104 678V599C104 590.72 97.28 584 89 584V574Z"
      fill="#999ACA"
      mask="url(#path-18-outside-2_248_72)"
    />
    <defs>
      <filter
        id="filter0_d_248_72"
        x={41.36}
        y={42.09}
        width={915.82}
        height={915.82}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset />
        <feGaussianBlur stdDeviation={6.41} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_248_72"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_248_72"
          result="shape"
        />
      </filter>
      <filter
        id="filter1_d_248_72"
        x={349.96}
        y={352.62}
        width={300.09}
        height={301.09}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy={3.66} />
        <feGaussianBlur stdDeviation={5.45} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_248_72"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_248_72"
          result="shape"
        />
      </filter>
      <linearGradient
        id="paint0_linear_248_72"
        x1={0}
        y1={0}
        x2={1000}
        y2={1000}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0.01} stopColor="#6366F1" />
        <stop offset={1} stopColor="#4043DD" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_248_72"
        x1={930}
        y1={69.27}
        x2={68.54}
        y2={930.73}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#EBECFF" />
        <stop offset={1} stopColor="#CFD0FF" />
      </linearGradient>
      <linearGradient
        id="paint2_linear_248_72"
        x1={499.74}
        y1={226.01}
        x2={499.74}
        y2={774.28}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="white" stopOpacity={0.45} />
        <stop offset={1} stopColor="white" />
      </linearGradient>
      <linearGradient
        id="paint3_linear_248_72"
        x1={499.23}
        y1={248.14}
        x2={499.23}
        y2={751.15}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#6366F1" />
        <stop offset={1} stopColor="#4043DD" />
      </linearGradient>
      <linearGradient
        id="paint4_linear_248_72"
        x1={499.47}
        y1={307.31}
        x2={499.47}
        y2={691.98}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#6366F1" />
        <stop offset={1} stopColor="#4043DD" />
      </linearGradient>
      <linearGradient
        id="paint5_linear_248_72"
        x1={630}
        y1={369}
        x2={369}
        y2={629}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#EDEEFF" />
        <stop offset={1} stopColor="#E8E8FF" />
      </linearGradient>
      <linearGradient
        id="paint6_linear_248_72"
        x1={100}
        y1={265}
        x2={100}
        y2={446}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#A8AAFF" />
        <stop offset={1} stopColor="white" />
      </linearGradient>
      <linearGradient
        id="paint7_linear_248_72"
        x1={109}
        y1={356}
        x2={69}
        y2={356}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#EAEAFF" />
        <stop offset={1} stopColor="#D1D2FF" />
      </linearGradient>
      <linearGradient
        id="paint8_linear_248_72"
        x1={859}
        y1={350}
        x2={859}
        y2={617}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#A8AAFF" />
        <stop offset={1} stopColor="white" />
      </linearGradient>
      <linearGradient
        id="paint9_linear_248_72"
        x1={910}
        y1={713.46}
        x2={876}
        y2={713.46}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#EAEAFF" />
        <stop offset={1} stopColor="#D1D2FF" />
      </linearGradient>
      <linearGradient
        id="paint10_linear_248_72"
        x1={100}
        y1={548}
        x2={100}
        y2={729}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#A8AAFF" />
        <stop offset={1} stopColor="white" />
      </linearGradient>
      <linearGradient
        id="paint11_linear_248_72"
        x1={109}
        y1={639}
        x2={69}
        y2={639}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#EAEAFF" />
        <stop offset={1} stopColor="#D1D2FF" />
      </linearGradient>
    </defs>
  </svg>
);

const VAULT_ANIMATION_SVG = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={1000}
    height={1000}
    viewBox="0 0 1000 1000"
    fill="none"
    className="absolute left-0 top-0 h-full w-full animate-spin duration-700"
    style={{
      animationDuration: "700ms",
      animationDirection: "alternate",
    }}
  >
    <title>Vault animation</title>
    <g filter="url(#filter0_d_248_92)">
      <rect
        x={215.03}
        y={748.37}
        width={750}
        height={56}
        rx={28}
        transform="rotate(-45 215.03 748.37)"
        fill="url(#paint0_linear_248_92)"
      />
      <rect
        x={209.38}
        y={748.37}
        width={758}
        height={64}
        rx={32}
        transform="rotate(-45 209.38 748.37)"
        stroke="#5F62D4"
        strokeWidth={8}
      />
    </g>
    <g filter="url(#filter1_d_248_92)">
      <rect
        x={254.63}
        y={218.04}
        width={750}
        height={56}
        rx={28}
        transform="rotate(45 254.63 218.04)"
        fill="url(#paint1_linear_248_92)"
      />
      <rect
        x={254.63}
        y={212.38}
        width={758}
        height={64}
        rx={32}
        transform="rotate(45 254.63 212.38)"
        stroke="#5F62D4"
        strokeWidth={8}
      />
    </g>
    <circle
      cx={500.17}
      cy={499.71}
      r={96.86}
      fill="url(#paint2_linear_248_92)"
      stroke="#7578E2"
      strokeWidth={8}
    />
    <circle
      cx={500.18}
      cy={499.71}
      r={54.32}
      fill="url(#paint3_radial_248_92)"
    />
    <defs>
      <filter
        id="filter0_d_248_92"
        x={207.91}
        y={219.08}
        width={584.17}
        height={584.17}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy={8.17} />
        <feGaussianBlur stdDeviation={5.36} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.39 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_248_92"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_248_92"
          result="shape"
        />
      </filter>
      <filter
        id="filter1_d_248_92"
        x={207.91}
        y={219.08}
        width={584.17}
        height={584.17}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy={8.17} />
        <feGaussianBlur stdDeviation={5.36} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.39 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_248_92"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_248_92"
          result="shape"
        />
      </filter>
      <linearGradient
        id="paint0_linear_248_92"
        x1={591}
        y1={748.37}
        x2={591}
        y2={804.37}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#C8CAFF" />
        <stop offset={0.5} stopColor="white" />
        <stop offset={1} stopColor="#C8CAFF" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_248_92"
        x1={630.6}
        y1={218.04}
        x2={630.6}
        y2={274.04}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#E5E6FF" />
        <stop offset={0.5} stopColor="white" />
        <stop offset={1} stopColor="#E5E6FF" />
      </linearGradient>
      <linearGradient
        id="paint2_linear_248_92"
        x1={593.04}
        y1={406.85}
        x2={407.31}
        y2={592.57}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#E8E9FF" />
        <stop offset={1} stopColor="#C2C4FF" />
      </linearGradient>
      <radialGradient
        id="paint3_radial_248_92"
        cx={0}
        cy={0}
        r={1}
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(500.18 499.71) rotate(135) scale(76.81 76.81)"
      >
        <stop stopColor="#E8E9FF" />
        <stop offset={1} stopColor="#B3B4E4" />
      </radialGradient>
    </defs>
  </svg>
);

export default function VaultIcon({ className }: VaultIconProps) {
  return (
    <div className={cn("relative", className)}>
      {VAULT_BASE_SVG}
      {VAULT_ANIMATION_SVG}
    </div>
  );
}
