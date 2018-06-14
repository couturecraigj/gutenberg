/**
 * External dependencies
 */
import classnames from 'classnames';
import { castArray, head, last } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, compose } from '@wordpress/element';
import { IconButton, Dropdown, NavigableMenu } from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import './style.scss';
import BlockModeToggle from './block-mode-toggle';
import BlockRemoveButton from './block-remove-button';
import BlockDuplicateButton from './block-duplicate-button';
import BlockTransformations from './block-transformations';
import SharedBlockSettings from './shared-block-settings';
import UnknownConverter from './unknown-converter';
import _BlockSettingsMenuFirstItem from './block-settings-menu-first-item';

export class BlockSettingsMenu extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			isFocused: false,
		};
		this.onFocus = this.onFocus.bind( this );
		this.onBlur = this.onBlur.bind( this );
	}

	onFocus() {
		this.setState( {
			isFocused: true,
		} );
	}

	onBlur() {
		this.setState( {
			isFocused: false,
		} );
	}

	render() {
		const {
			uids,
			onSelect,
			focus,
			rootUID,
			isHidden,
			isMultiSelecting,
			onAnnotate,
			onComment,
		} = this.props;
		const { isFocused } = this.state;
		const blockUIDs = castArray( uids );
		const count = blockUIDs.length;
		const firstBlockUID = blockUIDs[ 0 ];

		return (
			<div
				className={ classnames( 'editor-block-settings-menu', {
					'is-visible': isFocused || ! isHidden,
				} ) }
			>
				<Dropdown
					contentClassName="editor-block-settings-menu__popover"
					position="bottom left"
					renderToggle={ ( { onToggle, isOpen } ) => {
						const toggleClassname = classnames( 'editor-block-settings-menu__toggle', {
							'is-opened': isOpen,
						} );
						const label = isOpen ? __( 'Hide Options' ) : __( 'More Options' );

						return (
							<IconButton
								className={ toggleClassname }
								onClick={ () => {
									if ( count === 1 ) {
										onSelect( firstBlockUID );
									}
									onToggle();
								} }
								icon="ellipsis"
								label={ label }
								aria-expanded={ isOpen }
								focus={ focus }
								onFocus={ this.onFocus }
								onBlur={ this.onBlur }
							/>
						);
					} }
					renderContent={ ( { onClose } ) => (
						// Should this just use a DropdownMenu instead of a DropDown ?
						<NavigableMenu className="editor-block-settings-menu__content">
							<_BlockSettingsMenuFirstItem.Slot fillProps={ { onClose } } />
							{ count === 1 && <BlockModeToggle uid={ firstBlockUID } onToggle={ onClose } role="menuitem" /> }
							{ count === 1 && <UnknownConverter uid={ firstBlockUID } role="menuitem" /> }
							<BlockDuplicateButton uids={ uids } rootUID={ rootUID } role="menuitem" />
							{ count === 1 && <SharedBlockSettings uid={ firstBlockUID } onToggle={ onClose } itemsRole="menuitem" /> }
							<BlockTransformations uids={ uids } onClick={ onClose } itemsRole="menuitem" />
							<IconButton
								key="annotate"
								className="editor-block-settings-menu__control"
								onClick={ () => onAnnotate( isMultiSelecting, blockUIDs ) }
								icon="admin-generic"
							>
								{ __( 'Annotate' ) }
							</IconButton>

							<IconButton
								key="comment"
								className="editor-block-settings-menu__control"
								onClick={ () => onComment( blockUIDs ) }
								icon="admin-comments" >
								{ __( 'Add Comment' ) }
							</IconButton>
						</NavigableMenu>
					) }
				/>
				<BlockRemoveButton
					uids={ uids }
					onFocus={ this.onFocus }
					onBlur={ this.onBlur }
				/>
			</div>
		);
	}
}

export default compose( [
	withSelect( ( select ) => {
		return {
			isMultiSelecting: select( 'core/editor' ).isMultiSelecting(),
		};
	} ),
	withDispatch( ( dispatch ) => ( {
		onSelect( uid ) {
			dispatch( 'core/editor' ).selectBlock( uid );
		},
		onAnnotate( isMultiSelecting, uids ) {
			const firstBlock = head( uids );
			const lastBlock = last( uids );

			if (firstBlock === lastBlock) {
				dispatch( 'core/editor' ).annotateSelection();
			} else {
				dispatch( 'core/editor' ).annotateBlocks( firstBlock, lastBlock );
			}
		},
		onComment( uids ) {
			const firstBlock = head( uids );
			// const lastBlock = last( uids );

			const commentingOn = firstBlock;

			console.log( commentingOn );

			dispatch( 'core/editor' ).showCommentingUI( commentingOn );
		},
	} ) )
] )( BlockSettingsMenu );
