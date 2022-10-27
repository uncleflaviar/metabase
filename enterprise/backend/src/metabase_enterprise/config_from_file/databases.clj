(ns metabase-enterprise.config-from-file.databases
  (:require
   [clojure.spec.alpha :as s]
   [clojure.tools.logging :as log]
   [metabase-enterprise.config-from-file.interface :as config-from-file.i]
   [metabase.driver.util :as driver.u]
   [metabase.models.database :refer [Database]]
   [metabase.models.setting :refer [defsetting]]
   [metabase.util :as u]
   [metabase.util.i18n :refer [trs]]
   [toucan.db :as db]))

(defsetting config-from-file-sync-databases
  "Whether to sync newly created Databases during config-from-file initialization. By default, true, but you can disable
  this behavior if you want to sync it manually or use SerDes to populate its data model."
  :visibility :internal
  :type :boolean
  :default true)

(s/def :metabase-enterprise.config-from-file.databases.config-file-spec/name
  string?)

(s/def :metabase-enterprise.config-from-file.databases.config-file-spec/engine
  string?)

(s/def :metabase-enterprise.config-from-file.databases.config-file-spec/details
  map?)

(s/def ::config-file-spec
  (s/keys :req-un [:metabase-enterprise.config-from-file.databases.config-file-spec/engine
                   :metabase-enterprise.config-from-file.databases.config-file-spec/name
                   :metabase-enterprise.config-from-file.databases.config-file-spec/details]))

(defmethod config-from-file.i/section-spec :databases
  [_section]
  (s/spec (s/* ::config-file-spec)))

(defn- init-from-config-file!
  [database]
  ;; assert that we are able to connect to this Database. Otherwise, throw an Exception.
  (driver.u/can-connect-with-details? (keyword (:engine database)) (:details database) :throw-exceptions)
  (if-let [existing-database-id (db/select-one-id Database :engine (:engine database), :name (:name database))]
    (do
      (log/info (u/colorize :blue (trs "Updating Database {0} {1}" (:engine database) (pr-str (:name database)))))
      (db/update! Database existing-database-id database))
    (do
      (log/info (u/colorize :green (trs "Creating new {0} Database {1}" (:engine database) (pr-str (:name database)))))
      (let [db (db/insert! Database database)]
        (if (config-from-file-sync-databases)
          ((requiring-resolve 'metabase.sync/sync-database!) db)
          (log/info (trs "Sync on database creation when initializing from file is disabled. Skipping sync.")))))))

(defmethod config-from-file.i/initialize-section! :databases
  [_section-name databases]
  (doseq [database databases]
    (init-from-config-file! database)))
