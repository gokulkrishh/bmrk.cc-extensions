import { cn } from 'lib/utils';

export const Icon = ({ className }: { className?: string }) => {
  return (
    <svg
      className={cn('w-16 h-16', className)}
      xmlns="http://www.w3.org/2000/svg"
      width="512"
      height="512"
      fill="none"
      viewBox="0 0 512 512"
    >
      <g clipPath="url(#clip0_6_3)">
        <g filter="url(#filter0_dddddd_6_3)">
          <circle cx="256" cy="256" r="212" fill="#CB0001"></circle>
        </g>
        <path
          fill="#fff"
          d="M257.205 137.28c14.08 0 25.28 2.133 33.6 6.4 10.027 5.12 17.707 12.16 23.04 21.12 5.547 8.96 8.32 18.987 8.32 30.08 0 10.453-2.773 20.16-8.32 29.12-5.547 8.747-13.12 15.68-22.72 20.8 11.52 4.053 21.227 11.093 29.12 21.12 7.893 10.027 11.84 21.333 11.84 33.92 0 11.093-2.88 21.333-8.64 30.72-5.547 9.173-13.013 16.427-22.4 21.76-4.693 2.56-9.92 4.48-15.68 5.76-5.76 1.28-13.44 1.92-23.04 1.92h-98.56V137.28h93.44zM348.405 324.68c0-7.893 2.773-14.613 8.32-20.16 5.76-5.76 12.693-8.64 20.8-8.64 8.107 0 14.933 2.88 20.48 8.64 5.76 5.547 8.64 12.267 8.64 20.16 0 7.893-2.88 14.72-8.64 20.48-5.547 5.76-12.373 8.64-20.48 8.64-7.893 0-14.72-2.88-20.48-8.64-5.76-5.76-8.64-12.587-8.64-20.48z"
        ></path>
      </g>
      <defs>
        <filter
          id="filter0_dddddd_6_3"
          width="584"
          height="584"
          x="-36"
          y="-40"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          ></feColorMatrix>
          <feOffset dy="-0.111"></feOffset>
          <feGaussianBlur stdDeviation="1.107"></feGaussianBlur>
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.07 0"></feColorMatrix>
          <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_6_3"></feBlend>
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          ></feColorMatrix>
          <feOffset dy="-0.266"></feOffset>
          <feGaussianBlur stdDeviation="2.66"></feGaussianBlur>
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.0503198 0"></feColorMatrix>
          <feBlend in2="effect1_dropShadow_6_3" result="effect2_dropShadow_6_3"></feBlend>
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          ></feColorMatrix>
          <feOffset dy="-0.501"></feOffset>
          <feGaussianBlur stdDeviation="5.009"></feGaussianBlur>
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.0417275 0"></feColorMatrix>
          <feBlend in2="effect2_dropShadow_6_3" result="effect3_dropShadow_6_3"></feBlend>
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          ></feColorMatrix>
          <feOffset dy="-0.893"></feOffset>
          <feGaussianBlur stdDeviation="8.935"></feGaussianBlur>
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.035 0"></feColorMatrix>
          <feBlend in2="effect3_dropShadow_6_3" result="effect4_dropShadow_6_3"></feBlend>
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          ></feColorMatrix>
          <feOffset dy="-1.671"></feOffset>
          <feGaussianBlur stdDeviation="16.711"></feGaussianBlur>
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.0282725 0"></feColorMatrix>
          <feBlend in2="effect4_dropShadow_6_3" result="effect5_dropShadow_6_3"></feBlend>
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          ></feColorMatrix>
          <feOffset dy="-4"></feOffset>
          <feGaussianBlur stdDeviation="40"></feGaussianBlur>
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.0196802 0"></feColorMatrix>
          <feBlend in2="effect5_dropShadow_6_3" result="effect6_dropShadow_6_3"></feBlend>
          <feBlend in="SourceGraphic" in2="effect6_dropShadow_6_3" result="shape"></feBlend>
        </filter>
        <clipPath id="clip0_6_3">
          <path fill="#fff" d="M0 0H512V512H0z"></path>
        </clipPath>
      </defs>
    </svg>
  );
};

export const GoogleIcon = () => {
  return (
    <svg
      className=" mr-2"
      width="18"
      height="18"
      viewBox="0 0 256 262"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid"
    >
      <path
        d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
        fill="#4285F4"
      ></path>
      <path
        d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
        fill="#34A853"
      ></path>
      <path
        d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
        fill="#FBBC05"
      ></path>
      <path
        d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
        fill="#EB4335"
      ></path>
    </svg>
  );
};

export const LogoutIcon = () => {
  return (
    <svg
      className="h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
};
