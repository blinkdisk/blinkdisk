import { cn } from "@utils/class";

type VaultIconProps = {
  className?: string;
};

export default function VaultIcon({ className }: VaultIconProps) {
  return (
    <div className={cn("relative", className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={1000}
        height={1000}
        viewBox="0 0 1000 1000"
        fill="none"
        className="h-full w-full"
      >
        <rect
          width={1000}
          height={1000}
          rx={200}
          fill="url(#paint0_linear_248_72)"
        />
        <g filter="url(#filter0_d_248_72)">
          <rect
            x={68.543}
            y={69.2715}
            width={861.456}
            height={861.456}
            rx={172.291}
            fill="url(#paint1_linear_248_72)"
          />
          <rect
            x={61.3642}
            y={62.0927}
            width={875.814}
            height={875.814}
            rx={179.47}
            stroke="#3C3FD2"
            strokeWidth={14.3576}
          />
        </g>
        <rect
          opacity={0.1}
          x={68.543}
          y={485.643}
          width={861.456}
          height={11.4861}
          fill="black"
        />
        <rect
          opacity={0.3}
          x={68.543}
          y={497.128}
          width={861.456}
          height={11.4861}
          fill="white"
        />
        <circle
          cx={499.735}
          cy={500.148}
          r={279.67}
          fill="#A6A7FF"
          stroke="url(#paint2_linear_248_72)"
          strokeWidth={11.0661}
        />
        <circle
          cx={499.232}
          cy={499.644}
          r={251.502}
          fill="url(#paint3_linear_248_72)"
        />
        <ellipse
          cx={499.471}
          cy={499.645}
          rx={191.811}
          ry={192.336}
          fill="url(#paint4_linear_248_72)"
        />
        <path
          d="M496.607 703.849C497.56 703.862 498.515 703.869 499.472 703.869V730.869L497.986 730.864C497.401 730.861 496.817 730.853 496.233 730.845L496.607 703.849ZM502.709 730.845C501.632 730.86 500.552 730.869 499.472 730.869V703.869C500.428 703.869 501.383 703.862 502.336 703.849L502.709 730.845ZM451.532 698.156C453.37 698.603 455.218 699.025 457.076 699.421L451.445 725.826C449.337 725.377 447.24 724.899 445.154 724.392L451.532 698.156ZM553.788 724.392C551.702 724.899 549.606 725.377 547.498 725.826L544.683 712.624L541.867 699.421C543.725 699.025 545.574 698.603 547.412 698.156L553.788 724.392ZM602.12 706.649C600.2 707.613 598.265 708.55 596.314 709.461L584.896 684.996C586.615 684.194 588.321 683.368 590.014 682.519L602.12 706.649ZM408.93 682.519C410.623 683.368 412.329 684.193 414.049 684.996L402.628 709.46C400.678 708.55 398.743 707.613 396.823 706.65L408.93 682.519ZM370.858 657.714C372.323 658.921 373.805 660.108 375.303 661.274L358.716 682.578C357.019 681.257 355.342 679.913 353.684 678.546L370.858 657.714ZM645.26 678.546C643.602 679.913 641.924 681.257 640.228 682.578L631.935 671.927L623.642 661.274C625.14 660.108 626.621 658.921 628.085 657.714L645.26 678.546ZM339.207 625.057C340.369 626.559 341.551 628.045 342.754 629.514L332.308 638.065L332.309 638.066L321.863 646.617C320.502 644.955 319.164 643.273 317.849 641.572L339.207 625.057ZM681.095 641.572C679.779 643.273 678.44 644.955 677.079 646.617L666.635 638.066L656.189 629.514C657.392 628.045 658.575 626.559 659.736 625.057L681.095 641.572ZM315.594 586.223C316.392 587.945 317.214 589.655 318.059 591.351L293.894 603.391C292.936 601.468 292.004 599.531 291.099 597.578L315.594 586.223ZM707.845 597.578C706.94 599.531 706.008 601.468 705.05 603.391L692.968 597.371L680.885 591.351C681.73 589.655 682.552 587.945 683.351 586.223L707.845 597.578ZM301.246 543.133C301.64 544.993 302.06 546.844 302.504 548.685L276.258 555.02C275.754 552.933 275.279 550.834 274.832 548.726L301.246 543.133ZM724.111 548.726C723.665 550.834 723.188 552.932 722.685 555.02L696.44 548.685C696.885 546.844 697.304 544.993 697.698 543.133L724.111 548.726ZM269.824 500.695C269.824 499.702 269.83 498.711 269.843 497.721L269.847 497.457L296.844 497.829C296.831 498.783 296.824 499.738 296.824 500.695C296.824 501.653 296.831 502.609 296.844 503.562L269.847 503.933C269.832 502.855 269.824 501.776 269.824 500.695ZM729.119 500.695C729.119 501.776 729.111 502.855 729.096 503.933L702.1 503.562C702.113 502.609 702.119 501.653 702.119 500.695C702.119 499.738 702.113 498.783 702.1 497.829L729.096 497.457C729.111 498.535 729.119 499.614 729.119 500.695ZM276.258 446.371L302.504 452.707C302.06 454.548 301.64 456.399 301.246 458.259L288.039 455.461L274.832 452.664C275.211 450.876 275.609 449.096 276.029 447.323L276.258 446.371ZM722.685 446.371C723.188 448.458 723.665 450.556 724.111 452.664L710.905 455.462L710.904 455.461L697.698 458.259C697.304 456.399 696.885 454.548 696.44 452.707L722.685 446.371ZM318.059 410.04C317.214 411.736 316.392 413.446 315.594 415.169L291.098 403.812C292.003 401.86 292.935 399.922 293.893 398L318.059 410.04ZM705.051 398C706.009 399.922 706.94 401.86 707.845 403.812L683.351 415.169C682.552 413.446 681.73 411.736 680.885 410.04L705.051 398ZM342.754 371.878C341.552 373.346 340.37 374.832 339.208 376.334L317.849 359.818C319.164 358.117 320.503 356.435 321.864 354.772L342.754 371.878ZM677.079 354.772C678.441 356.435 679.779 358.117 681.095 359.818L659.736 376.334C658.575 374.832 657.392 373.346 656.189 371.878L677.079 354.772ZM358.716 318.812L375.303 340.117C373.805 341.284 372.323 342.471 370.858 343.678L353.684 322.845C355.007 321.754 356.343 320.677 357.69 319.615L358.716 318.812ZM640.228 318.812C641.924 320.133 643.602 321.478 645.26 322.845L628.085 343.678C626.621 342.471 625.14 341.283 623.642 340.117L640.228 318.812ZM414.049 316.396C412.329 317.198 410.623 318.024 408.93 318.873L396.823 294.74C398.743 293.777 400.678 292.84 402.628 291.93L414.049 316.396ZM596.315 291.929C598.266 292.839 600.2 293.777 602.12 294.74L590.014 318.873C588.321 318.024 586.615 317.198 584.896 316.396L596.315 291.929ZM457.076 301.97C455.219 302.366 453.37 302.788 451.532 303.234L445.154 276.999C447.24 276.492 449.337 276.013 451.445 275.563L457.076 301.97ZM547.498 275.563C549.606 276.013 551.702 276.492 553.788 276.999L547.412 303.234C545.574 302.787 543.725 302.366 541.867 301.97L547.498 275.563ZM499.472 270.522C500.552 270.522 501.632 270.53 502.709 270.545L502.523 284.044L502.522 284.043L502.336 297.542C501.383 297.529 500.428 297.522 499.472 297.522C498.515 297.522 497.56 297.529 496.607 297.542L496.233 270.545C497.311 270.53 498.39 270.522 499.472 270.522Z"
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
            d="M500 364.424C574.341 364.424 634.576 424.916 634.576 499.5C634.576 574.084 574.341 634.576 500 634.576C425.659 634.576 365.424 574.084 365.424 499.5C365.424 424.916 425.659 364.424 500 364.424Z"
            stroke="white"
            strokeOpacity={0.35}
            strokeWidth={9.15251}
            shapeRendering="crispEdges"
          />
        </g>
        <path
          d="M69 265H90C112.644 265 131 283.356 131 306V405C131 427.644 112.644 446 90 446H69V265Z"
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
          <path d="M69 296H89C100.046 296 109 304.954 109 316V395C109 406.046 100.046 415 89 415H69V296Z" />
        </mask>
        <path
          d="M69 296H89C100.046 296 109 304.954 109 316V395C109 406.046 100.046 415 89 415H69V296Z"
          fill="url(#paint7_linear_248_72)"
        />
        <path
          d="M69 291H89C102.807 291 114 302.193 114 316H104C104 307.716 97.2843 301 89 301H69V291ZM114 395C114 408.807 102.807 420 89 420H69V410H89C97.2843 410 104 403.284 104 395H114ZM104 395M69 415V296V415M89 291C102.807 291 114 302.193 114 316V395C114 408.807 102.807 420 89 420V410C97.2843 410 104 403.284 104 395V316C104 307.716 97.2843 301 89 301V291Z"
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
          d="M69 548H90C112.644 548 131 566.356 131 589V688C131 710.644 112.644 729 90 729H69V548Z"
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
          <path d="M69 579H89C100.046 579 109 587.954 109 599V678C109 689.046 100.046 698 89 698H69V579Z" />
        </mask>
        <path
          d="M69 579H89C100.046 579 109 587.954 109 599V678C109 689.046 100.046 698 89 698H69V579Z"
          fill="url(#paint11_linear_248_72)"
        />
        <path
          d="M69 574H89C102.807 574 114 585.193 114 599H104C104 590.716 97.2843 584 89 584H69V574ZM114 678C114 691.807 102.807 703 89 703H69V693H89C97.2843 693 104 686.284 104 678H114ZM104 678M69 698V579V698M89 574C102.807 574 114 585.193 114 599V678C114 691.807 102.807 703 89 703V693C97.2843 693 104 686.284 104 678V599C104 590.716 97.2843 584 89 584V574Z"
          fill="#999ACA"
          mask="url(#path-18-outside-2_248_72)"
        />
        <defs>
          <filter
            id="filter0_d_248_72"
            x={41.3575}
            y={42.0879}
            width={915.824}
            height={915.823}
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
            <feGaussianBlur stdDeviation={6.41306} />
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
            x={349.956}
            y={352.617}
            width={300.088}
            height={301.088}
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
            <feOffset dy={3.661} />
            <feGaussianBlur stdDeviation={5.44574} />
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
            x1={929.999}
            y1={69.2715}
            x2={68.543}
            y2={930.728}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#EBECFF" />
            <stop offset={1} stopColor="#CFD0FF" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_248_72"
            x1={499.735}
            y1={226.011}
            x2={499.735}
            y2={774.285}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity={0.45} />
            <stop offset={1} stopColor="white" />
          </linearGradient>
          <linearGradient
            id="paint3_linear_248_72"
            x1={499.232}
            y1={248.143}
            x2={499.232}
            y2={751.146}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#6366F1" />
            <stop offset={1} stopColor="#4043DD" />
          </linearGradient>
          <linearGradient
            id="paint4_linear_248_72"
            x1={499.471}
            y1={307.309}
            x2={499.471}
            y2={691.982}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#6366F1" />
            <stop offset={1} stopColor="#4043DD" />
          </linearGradient>
          <linearGradient
            id="paint5_linear_248_72"
            x1={630}
            y1={369}
            x2={369.002}
            y2={628.998}
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
            y1={713.462}
            x2={876}
            y2={713.462}
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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={1000}
        height={1000}
        viewBox="0 0 1000 1000"
        fill="none"
        className="duration-2000 absolute left-0 top-0 h-full w-full animate-spin"
        style={{
          animationDuration: "2000ms",
          animationDirection: "alternate",
        }}
      >
        <g filter="url(#filter0_d_248_92)">
          <rect
            x={215.035}
            y={748.366}
            width={750}
            height={55.9999}
            rx={28}
            transform="rotate(-45 215.035 748.366)"
            fill="url(#paint0_linear_248_92)"
          />
          <rect
            x={209.378}
            y={748.366}
            width={758}
            height={63.9999}
            rx={32}
            transform="rotate(-45 209.378 748.366)"
            stroke="#5F62D4"
            strokeWidth={8}
          />
        </g>
        <g filter="url(#filter1_d_248_92)">
          <rect
            x={254.633}
            y={218.036}
            width={750}
            height={56}
            rx={28}
            transform="rotate(45 254.633 218.036)"
            fill="url(#paint1_linear_248_92)"
          />
          <rect
            x={254.633}
            y={212.379}
            width={758}
            height={64}
            rx={32}
            transform="rotate(45 254.633 212.379)"
            stroke="#5F62D4"
            strokeWidth={8}
          />
        </g>
        <circle
          cx={500.174}
          cy={499.709}
          r={96.8617}
          fill="url(#paint2_linear_248_92)"
          stroke="#7578E2"
          strokeWidth={8}
        />
        <circle
          cx={500.175}
          cy={499.71}
          r={54.3153}
          fill="url(#paint3_radial_248_92)"
        />
        <defs>
          <filter
            id="filter0_d_248_92"
            x={207.914}
            y={219.082}
            width={584.172}
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
            <feOffset dy={8.16684} />
            <feGaussianBlur stdDeviation={5.35949} />
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
            x={207.914}
            y={219.082}
            width={584.168}
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
            <feOffset dy={8.16684} />
            <feGaussianBlur stdDeviation={5.35949} />
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
            x1={590.999}
            y1={748.366}
            x2={590.999}
            y2={804.366}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#C8CAFF" />
            <stop offset={0.5} stopColor="white" />
            <stop offset={1} stopColor="#C8CAFF" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_248_92"
            x1={630.597}
            y1={218.036}
            x2={630.597}
            y2={274.036}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#E5E6FF" />
            <stop offset={0.5} stopColor="white" />
            <stop offset={1} stopColor="#E5E6FF" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_248_92"
            x1={593.036}
            y1={406.848}
            x2={407.312}
            y2={592.571}
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
            gradientTransform="translate(500.175 499.71) rotate(135) scale(76.8135 76.8135)"
          >
            <stop stopColor="#E8E9FF" />
            <stop offset={1} stopColor="#B3B4E4" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
