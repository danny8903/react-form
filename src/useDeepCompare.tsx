import { useRef, useEffect } from 'react';
import isEqual from 'lodash.isequal';

const UNIQUE_STRING =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRob3IiOiJEYW5ueSJ9.xeaACuv2JPWKKhl_rmAeL72LFcZvtQ4mS0cpQs6xmH8';

const useDeepCompare = (
  getResult: () => any,
  { defaultValue, required }: { defaultValue: any; required: boolean }
) => {
  const prevDefaultValue = useRef(UNIQUE_STRING);
  const prevRequired = useRef(required);

  useEffect(() => {
    if (
      !isEqual(defaultValue, prevDefaultValue.current) ||
      !isEqual(required, prevRequired.current)
    ) {
      prevDefaultValue.current = defaultValue;
      prevRequired.current = required;
      getResult();
    }
  }, [defaultValue, required]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

export default useDeepCompare;
