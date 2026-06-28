let
  rev = "1cb1c02a6b1b7cf67e3d7731cbbf327a53da9679"; 
  
  nixpkgs = fetchTarball {
    url = "https://github.com/NixOS/nixpkgs/archive/${rev}.tar.gz";
  };

  pkgs = import nixpkgs {};
in
pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs_24
    pkgs.postgresql
  ];

  shellHook = ''
    export PKG_CONFIG_PATH="${pkgs.openssl.dev}/lib/pkgconfig"
  '';
}
