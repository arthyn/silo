interface ImportMetaEnv extends Readonly<Record<string, string | boolean | undefined>> {
  /* Add custom env properties here */
  SILO_STORAGE_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
