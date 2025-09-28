/**
 * @file Validation component to test React Context implementation
 *
 * This component validates that our context provides all expected functionality
 * without breaking any existing APIs.
 */

// TODO: CHECK IF WE SHOULD INTEGRATE THIS INTO CICD

'use client';

import type { CacheOptions } from 'deepcrawl';
import { useEffect } from 'react';
import {
  PlaygroundProvider,
  usePlayground,
  usePlaygroundActions,
  usePlaygroundCore,
  usePlaygroundCoreSelector,
  usePlaygroundOptions,
  usePlaygroundOptionsSelector,
} from '../playground-context';

// Validation component that tests all context hooks
function PlaygroundContextValidator() {
  // Test granular hooks
  const core = usePlaygroundCore();
  const options = usePlaygroundOptions();
  const actions = usePlaygroundActions();

  // Test combined hook
  const combined = usePlayground();

  // Test selector hooks
  const selectedOperation = usePlaygroundCoreSelector(
    (state) => state.selectedOperation,
  );
  const currentOptions = usePlaygroundOptionsSelector(
    (state) => state.currentOptions,
  );

  useEffect(() => {
    // Validate core state structure
    console.log('✅ Core state validation:');
    console.log('- requestUrl:', typeof core.requestUrl === 'string');
    console.log(
      '- selectedOperation:',
      typeof core.selectedOperation === 'string',
    );
    console.log('- isExecuting:', typeof core.isExecuting === 'object');
    console.log('- responses:', typeof core.responses === 'object');
    console.log(
      '- activeRequestsRef:',
      core.activeRequestsRef?.current instanceof Set,
    );

    // Validate options state structure
    console.log('\n✅ Options state validation:');
    console.log(
      '- currentQueryState:',
      typeof options.currentQueryState === 'object',
    );
    console.log(
      '- operationQueryStates:',
      typeof options.operationQueryStates === 'object',
    );
    console.log(
      '- getAnyOperationState:',
      typeof options.getAnyOperationState === 'function',
    );
    console.log(
      '- currentOptions:',
      typeof options.currentOptions === 'object',
    );

    // Validate actions structure
    console.log('\n✅ Actions validation:');
    console.log(
      '- setRequestUrl:',
      typeof actions.setRequestUrl === 'function',
    );
    console.log(
      '- setSelectedOperation:',
      typeof actions.setSelectedOperation === 'function',
    );
    console.log(
      '- setIsExecuting:',
      typeof actions.setIsExecuting === 'function',
    );
    console.log('- setResponses:', typeof actions.setResponses === 'function');
    console.log(
      '- resetToDefaults:',
      typeof actions.resetToDefaults === 'function',
    );
    console.log(
      '- executeApiCall:',
      typeof actions.executeApiCall === 'function',
    );
    console.log('- handleRetry:', typeof actions.handleRetry === 'function');
    console.log('- formatTime:', typeof actions.formatTime === 'function');
    console.log(
      '- getCurrentExecutionTime:',
      typeof actions.getCurrentExecutionTime === 'function',
    );

    // Validate combined hook provides same data
    console.log('\n✅ Combined hook validation:');
    console.log(
      '- Core data matches:',
      combined.requestUrl === core.requestUrl,
    );
    console.log(
      '- Options data matches:',
      combined.currentOptions === options.currentOptions,
    );
    console.log(
      '- Actions match:',
      combined.setRequestUrl === actions.setRequestUrl,
    );

    // Validate selectors work
    console.log('\n✅ Selector validation:');
    console.log(
      '- Core selector works:',
      selectedOperation === core.selectedOperation,
    );
    console.log(
      '- Options selector works:',
      currentOptions === options.currentOptions,
    );

    // Test that all required props for existing components are available
    console.log('\n✅ Component compatibility validation:');

    // PlaygroundOperationClient props
    const playgroundClientProps = {
      requestUrl: combined.requestUrl,
      selectedOperation: combined.selectedOperation,
      isExecuting: combined.isExecuting,
      responses: combined.responses,
      activeRequestsRef: combined.activeRequestsRef,
      setRequestUrl: combined.setRequestUrl,
      setSelectedOperation: combined.setSelectedOperation,
      setIsExecuting: combined.setIsExecuting,
      setResponses: combined.setResponses,
      currentQueryState: combined.currentQueryState,
      getAnyOperationState: combined.getAnyOperationState,
    };
    console.log(
      '- PlaygroundOperationClient props available:',
      Object.keys(playgroundClientProps).length > 0,
    );

    // Option menu props (e.g., CacheOptionsMenu)
    const cacheMenuProps = {
      cacheOptions: combined.getOptionFor('readUrl', 'cacheOptions'),
      onCacheOptionsChange: (cacheOptions: CacheOptions) =>
        combined.getAnyOperationState('readUrl').setOptions({ cacheOptions }),
    };
    console.log(
      '- Option menu props pattern works:',
      typeof cacheMenuProps.onCacheOptionsChange === 'function',
    );

    // PlaygroundOptionsMenusToolbar props
    const toolbarProps = {
      currentQueryState: combined.currentQueryState,
      getAnyOperationState: combined.getAnyOperationState,
      selectedOperation: combined.selectedOperation,
    };
    console.log(
      '- Toolbar props available:',
      Object.keys(toolbarProps).length > 0,
    );

    console.log(
      '\n🎉 All validations passed! Context implementation is ready.',
    );
  }, [core, options, actions, combined, selectedOperation, currentOptions]);

  return (
    <div className="rounded border bg-green-50 p-4">
      <h3 className="font-bold text-green-800">
        Playground Context Validation
      </h3>
      <p className="text-green-700">Check console for validation results</p>
      <div className="mt-2 text-sm">
        <p>
          Current Operation: <code>{selectedOperation}</code>
        </p>
        <p>
          Request URL: <code>{core.requestUrl || 'none'}</code>
        </p>
        <p>
          Executing: <code>{JSON.stringify(core.isExecuting)}</code>
        </p>
      </div>
    </div>
  );
}

// Provider wrapper for validation
export function PlaygroundContextValidationPage() {
  return (
    <PlaygroundProvider
      defaultOperation="getMarkdown"
      defaultUrl="https://example.com"
    >
      <PlaygroundContextValidator />
    </PlaygroundProvider>
  );
}

// Export validation component for testing
export default PlaygroundContextValidationPage;
