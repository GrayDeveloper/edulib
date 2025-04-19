const { MagnifyingGlass } = require("@phosphor-icons/react/dist/ssr");

const Search = () => {};

const SearchBar = () => {
  return (
    <div className="flex items-center gap-5 px-5 py-3 rounded-2xl w-full outline-4 outline-mint bg-softmint">
      <MagnifyingGlass size={28} weight="bold" className="text-mint/50 " />
      <input
        value={SearchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") Search();
        }}
        placeholder={"Keresés..."}
        className="text-xl font-medium focus:ring-0 outline-none w-full bg-transparent text-charcoal placeholder:text-charcoal/70 "
      />
    </div>
  );
};

const SearchResults = () => {};

module.exports = {
  SearchBar,
  Search,
  SearchResults,
};
