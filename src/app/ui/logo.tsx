import { SvgIcon } from "@mui/material";

const abcLogo = () => (
  <SvgIcon
    viewBox="0 0 800 300"
    sx={{
      width: { xs: "300%", sm: 400 },
      height: { xs: 280, sm: 150 },
    }}
    preserveAspectRatio="xMinYMid meet"
  >
    <defs>
      <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00CFFF" />
        <stop offset="100%" stopColor="#0055FF" />
      </linearGradient>
    </defs>

    {/* Stylized Z Icon */}
    {/* <g transform="translate(10, 20)">
      <path
        d="M 0 0 L 40 0 L 10 40 L 50 40 L 20 80"
        fill="none"
        stroke="url(#blueGradient)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g> */}

    {/* Logo Text */}
    <text
      x="200"
      y="100"
      fill="url(#blueGradient)"
      fontFamily="Montserrat, Montserrat, sans-serif"
      fontSize="80"
      // fontWeight="bold"
      letterSpacing="2"
    >
      abc
    </text>
  </SvgIcon>
);

export default abcLogo;
