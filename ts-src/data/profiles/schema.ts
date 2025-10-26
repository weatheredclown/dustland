type ProfileSchema = {
  $schema: string;
  title: string;
  type: 'object';
  additionalProperties: {
    type: 'object';
    properties: {
      mods: {
        type: 'object';
        additionalProperties: { type: 'number' };
      };
      effects: {
        type: 'array';
        items: { type: 'object' };
      };
    };
    additionalProperties: false;
  };
};

const profileSchema: ProfileSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Profiles',
  type: 'object',
  additionalProperties: {
    type: 'object',
    properties: {
      mods: {
        type: 'object',
        additionalProperties: { type: 'number' }
      },
      effects: {
        type: 'array',
        items: { type: 'object' }
      }
    },
    additionalProperties: false
  }
};

interface ProfileGlobals extends GlobalThis {
  PROFILE_SCHEMA?: ProfileSchema;
}

const profileGlobals = globalThis as unknown as ProfileGlobals;
profileGlobals.PROFILE_SCHEMA = profileSchema;
