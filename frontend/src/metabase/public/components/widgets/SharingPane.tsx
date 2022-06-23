import React, { useState } from "react";
import { t, jt } from "ttag";
import Link from "metabase/core/components/Link";
import Icon from "metabase/components/Icon";
import Toggle from "metabase/core/components/Toggle";
import CopyWidget from "metabase/components/CopyWidget";
import Confirm from "metabase/components/Confirm";

import { getPublicEmbedHTML } from "metabase/public/lib/code";

import cx from "classnames";

import * as MetabaseAnalytics from "metabase/lib/analytics";
import { Description } from "./SharingPane.styled";

interface SharingPaneProps {
  resource: any;
  resourceType: any;
  onCreatePublicLink: any;
  onDisablePublicLink: any;
  extensions: any;
  getPublicUrl: any;
  onChangeEmbedType: any;
  isAdmin: any;
  isPublicSharingEnabled: any;
  isApplicationEmbeddingEnabled: any;
}

export default function SharingPane({
  resource,
  resourceType,
  onCreatePublicLink,
  onDisablePublicLink,
  extensions = [],
  getPublicUrl,
  onChangeEmbedType,
  isAdmin,
  isPublicSharingEnabled,
  isApplicationEmbeddingEnabled,
}: SharingPaneProps) {
  const [extensionState, setExtension] = useState(null);

  const publicLink = getPublicUrl(resource, extensionState);
  const iframeSource = getPublicEmbedHTML(getPublicUrl(resource));

  const shouldDisableEmbedding = !isAdmin || !isApplicationEmbeddingEnabled;

  const embeddingHelperText = getEmbeddingHelperText({
    isAdmin,
    isApplicationEmbeddingEnabled,
  });

  return (
    <div className="pt2 ml-auto mr-auto" style={{ maxWidth: 600 }}>
      {isAdmin && isPublicSharingEnabled && (
        <div className="pb2 mb4 border-bottom flex align-center">
          <h4>{t`Enable sharing`}</h4>
          <div className="ml-auto">
            {resource.public_uuid ? (
              <Confirm
                title={t`Disable this public link?`}
                content={t`This will cause the existing link to stop working. You can re-enable it, but when you do it will be a different link.`}
                action={() => {
                  MetabaseAnalytics.trackStructEvent(
                    "Sharing Modal",
                    "Public Link Disabled",
                    resourceType,
                  );
                  onDisablePublicLink();
                }}
              >
                <Toggle value={true} />
              </Confirm>
            ) : (
              <Toggle
                value={false}
                onChange={() => {
                  MetabaseAnalytics.trackStructEvent(
                    "Sharing Modal",
                    "Public Link Enabled",
                    resourceType,
                  );
                  onCreatePublicLink();
                }}
              />
            )}
          </div>
        </div>
      )}
      <div
        className={cx("mb4 flex align-start", {
          disabled: !resource.public_uuid,
        })}
      >
        <div
          style={{ width: 98, height: 63 }}
          className="bordered rounded shadowed flex layout-centered"
        >
          <Icon name="link" size={32} />
        </div>
        <div className="ml2">
          <h3 className="text-brand mb1">{t`Public link`}</h3>
          <Description className="mb1">{t`Share this ${resourceType} with people who don't have a Metabase account using the URL below:`}</Description>
          <CopyWidget value={publicLink} />
          {extensions && extensions.length > 0 && (
            <div className="mt1">
              {extensions.map(extension => (
                <span
                  key={extension}
                  className={cx(
                    "cursor-pointer text-brand-hover text-bold text-uppercase",
                    extension === extensionState ? "text-brand" : "text-light",
                  )}
                  onClick={() =>
                    setExtension(extensionState =>
                      extension === extensionState ? null : extension,
                    )
                  }
                >
                  {extension}{" "}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div
        className={cx("mb4 flex align-start", {
          disabled: !resource.public_uuid,
        })}
      >
        <img
          width={98}
          src="app/assets/img/simple_embed.png"
          srcSet="
              app/assets/img/simple_embed.png     1x,
              app/assets/img/simple_embed@2x.png  2x
            "
        />
        <div className="ml2">
          <h3 className="text-green mb1">{t`Public embed`}</h3>
          <Description className="mb1">{t`Embed this ${resourceType} in blog posts or web pages by copying and pasting this snippet:`}</Description>
          <CopyWidget value={iframeSource} />
        </div>
      </div>
      <div
        className={cx("mb4 flex align-start", {
          disabled: shouldDisableEmbedding,
          "cursor-pointer": !shouldDisableEmbedding,
        })}
        onClick={() => {
          if (!shouldDisableEmbedding) {
            console.log("wow man");
            onChangeEmbedType("application");
          }
        }}
      >
        <img
          width={100}
          src="app/assets/img/secure_embed.png"
          srcSet="
                app/assets/img/secure_embed.png     1x,
                app/assets/img/secure_embed@2x.png  2x
              "
        />
        <div className="ml2">
          <h3 className="text-purple mb1">{t`Embed this ${resourceType} in an application`}</h3>
          <Description>{t`By integrating with your application server code, you can provide a secure stats ${resourceType} limited to a specific user, customer, organization, etc.`}</Description>
          {embeddingHelperText && (
            <Description enableMouseEvents>{embeddingHelperText}</Description>
          )}
        </div>
      </div>
    </div>
  );
}

function getEmbeddingHelperText({
  isAdmin,
  isApplicationEmbeddingEnabled,
}: {
  isAdmin: boolean;
  isApplicationEmbeddingEnabled: boolean;
}) {
  if (!isAdmin) {
    return t`Only Admins are able to embed questions. If you need access to this feature, reach out to them for permissions.`;
  }

  if (!isApplicationEmbeddingEnabled && isAdmin) {
    return jt`In order to embed your question, you have to first ${(
      <a
        className="link"
        href="/admin/settings/embedding_in_other_applications"
      >
        enable embedding in your Admin settings.
      </a>
    )}`;
  }

  return null;
}
